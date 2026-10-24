import { Store } from './store';
import { BALANCE } from '../shared/economy-balance';
import type { Economy } from '../shared/economy-types';
/** GAM-06: study grants game XP and study achievements only. It never credits centelhas or production. */
export const STUDY_XP = { focusMinute: 2, review: 3 } as const;
const CONSISTENCY = { minutes: 10, reviews: 5, maxReviewsPerDay: 100 } as const;
type Award=(source:string,label:string,xp:number)=>void;
const dayKey=(at:number)=>{const d=new Date(at);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export function baselineStudy(store:Store,e:Economy) {
 e.study.reviewCursor=Number(store.db.prepare('SELECT coalesce(max(rowid),0) n FROM card_reviews').get()!.n);
 for(const row of store.db.prepare('SELECT id,elapsed_ms FROM focus_sessions').all())e.study.focus[String(row.id)]=Math.floor(Number(row.elapsed_ms)/60000);
}
export function syncStudy(store:Store,e:Economy,award:Award) {
 const grant=(source:string,kind:'focus'|'review',units:number,at:number)=>{
  if(store.db.prepare('SELECT source FROM economic_receipts WHERE source=?').get(source))return;
  const key=dayKey(at);if(e.study.lastDay!==key){
   const yesterday=dayKey(at-86400000);e.study.streak=e.study.lastDay===yesterday?e.study.streak:0;
   e.study.lastDay=key;e.study.dayMinutes=0;e.study.dayReviews=0;
  }
  const qualifiedBefore=e.study.dayMinutes>=CONSISTENCY.minutes||e.study.dayReviews>=CONSISTENCY.reviews;
  if(kind==='focus'){e.focusMinutes+=units;e.study.dayMinutes+=units;}else{e.reviews+=units;e.study.dayReviews+=units;}
  const qualified=e.study.dayMinutes>=CONSISTENCY.minutes||e.study.dayReviews>=CONSISTENCY.reviews;
  if(qualified&&!qualifiedBefore){e.study.streak++;e.studyDays++;}
  const xp=kind==='focus'?STUDY_XP.focusMinute*units:STUDY_XP.review;
  award(source,kind==='focus'?`Estudo: ${units} minuto(s) efetivos`:'Estudo: revisão concluída',xp);
  // amount stays '0': receipts written since rules v3 grant XP, never currency.
  store.db.prepare('INSERT INTO economic_receipts(source,kind,amount,at,version) VALUES(?,?,?,?,?)').run(source,kind,'0',at,BALANCE.version);
  store.audit('game.study-xp',source,'ok');
 };
 // Only persisted monotonic elapsed time is eligible. Pauses and app downtime
 // never become study time; historical minutes are baselined at migration.
 for(const row of store.db.prepare('SELECT id,elapsed_ms,checkpoint_at FROM focus_sessions WHERE checkpoint_at>=? ORDER BY checkpoint_at').all(e.study.baselineAt)){
  const id=String(row.id),minutes=Math.floor(Number(row.elapsed_ms)/60000),previous=e.study.focus[id]??0;
  if(minutes>previous){grant(`study-focus:${id}:${minutes}`,'focus',minutes-previous,Number(row.checkpoint_at));e.study.focus[id]=minutes;}
 }
 // A due review counts once per card/local day; early repeated ratings are valid study but grant nothing more.
 const reviews=store.db.prepare("SELECT r.rowid cursor,r.id,r.card_id,r.at,r.request FROM card_reviews r JOIN economic_receipts eligible ON eligible.source='review-source:'||r.id LEFT JOIN economic_receipts consumed ON consumed.source='review-read:'||r.id WHERE consumed.source IS NULL ORDER BY r.at,r.rowid LIMIT 1000").all();
 for(const row of reviews){
  e.study.reviewCursor=Number(row.cursor);const at=Number(row.at),source=`study-review:${row.card_id}:${dayKey(at)}`;
  const request=JSON.parse(String(row.request));
  if(at>=e.study.baselineAt&&request&&(e.study.lastDay!==dayKey(at)||e.study.dayReviews<CONSISTENCY.maxReviewsPerDay))grant(source,'review',1,at);
  store.db.prepare('INSERT INTO economic_receipts(source,kind,amount,at,version) VALUES(?,?,?,?,?)').run('review-read:'+row.id,'review-consumed','0',at,BALANCE.version);
 }
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Store } from '../src/main/store';
import { Desks } from '../src/main/desk';
import { Videos } from '../src/main/videos';
import { Vault } from '../src/main/vault';
import { Game } from '../src/main/game';
import { allowedVideoRequest, parseYoutubeLink, youtubeEmbedUrl, videoAddInput, videoLayoutInput } from '../src/shared/videos';
const id = 'M7lc1UVf-VE';
test('links YouTube viram ID/tempo canônicos; protocolos, credenciais, hosts e IDs arbitrários não chegam ao player', () => {
  for (const url of [`https://www.youtube.com/watch?v=${id}&t=1m2s&tracking=ignore`, `https://youtu.be/${id}?t=62`, `https://m.youtube.com/shorts/${id}?start=62`, `https://www.youtube-nocookie.com/embed/${id}#t=62`, `youtube.com/live/${id}?t=62s`]) assert.deepEqual(parseYoutubeLink(url), { youtubeId: id, startSeconds: 62, url: `https://www.youtube.com/watch?v=${id}&t=62s` });
  for (const url of ['javascript:alert(1)', 'file:///private.md', 'http://youtube.com/watch?v='+id, 'https://youtube.com.evil.test/watch?v='+id, 'https://youtube.com@evil.test/'+id, 'https://user:pass@youtube.com/watch?v='+id, 'https://youtube.com:444/watch?v='+id, 'https://youtube.com/watch?v='+id+'&v=aaaaaaaaaaa', 'https://youtube.com/playlist?list='+id, 'https://youtu.be/too-short', `https://youtu.be/${id}/extra`, `https://youtu.be/${id}?t=90000`, `https://youtu.be/${id}?t=NaN`]) assert.throws(() => parseYoutubeLink(url), /YouTube|HTTPS|vídeo|inicial/);
  assert.ok(!youtubeEmbedUrl({ youtubeId: id, startSeconds: 62 }).includes('tracking'));
  assert.throws(() => youtubeEmbedUrl({ youtubeId: '../private', startSeconds: 0 }));
  for (const url of ['file:///secret', 'study://app/index.html', 'https://127.0.0.1/', 'https://youtube.com.attacker.test/', 'https://user@google.com/', 'https://googlevideo.com:8443/']) assert.equal(allowedVideoRequest(url), false);
  assert.equal(allowedVideoRequest('https://r1---fixture.googlevideo.com/videoplayback'), true);
  assert.throws(() => videoLayoutInput.parse({ visible: true, x: -1, y: 0, width: 300, height: 200 }));
  assert.throws(() => videoAddInput.parse({ subjectId: crypto.randomUUID(), title: '', url: `https://youtu.be/${id}`, source: 'file' }));
});
test('vídeos por matéria: dedup/retomada/referências e rollback real do audit não perdem dados', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/videos-test-')); let store = new Store(dir);
  try {
    const a = store.createSubject({ name: 'A', color: 'sage' }), b = store.createSubject({ name: 'B', color: 'blue' });
    let videos = new Videos(store), desks = new Desks(store);
    const video = videos.add({ subjectId: a.id, title: '<script>fonte inerte</script>', url: `https://youtu.be/${id}?t=10` });
    assert.equal(videos.add({ subjectId: a.id, title: 'Duplicado', url: `https://youtube.com/watch?v=${id}` }).id, video.id);
    assert.equal(videos.list(a.id).length, 1); assert.equal(videos.list(b.id).length, 0);
    const before = desks.get(b.id); assert.throws(() => desks.save({ subjectId: b.id, videoId: video.id }), /pertencer/); assert.deepEqual(desks.get(b.id), before);
    assert.throws(() => videos.remove({ subjectId: b.id, id: video.id }), /matéria/);
    desks.save({ subjectId: a.id, videoId: video.id, materialView: 'video' });
    store.db.exec("CREATE TRIGGER fail_video_delete BEFORE INSERT ON audit_events WHEN NEW.action='video.remove' BEGIN SELECT RAISE(ABORT,'fixture audit failure'); END;");
    assert.throws(() => videos.remove({ subjectId: a.id, id: video.id }), /fixture audit failure/); assert.equal(desks.get(a.id).videoId, video.id); assert.equal(videos.list(a.id).length, 1);
    store.db.exec('DROP TRIGGER fail_video_delete'); store.close(); store = new Store(dir); videos = new Videos(store); desks = new Desks(store);
    assert.equal(desks.get(a.id).videoId, video.id); assert.equal(videos.get({ subjectId: a.id, id: video.id }).startSeconds, 10);
    videos.remove({ subjectId: a.id, id: video.id }); assert.equal(desks.get(a.id).videoId, null); assert.equal(videos.list(a.id).length, 0);
  } finally { store.close(); }
});
test('migração v3 para v6 conserva bytes, rascunho, mesa e economia existentes', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/videos-migration-')), root = path.join(dir, 'vault'); fs.mkdirSync(root); let store = new Store(path.join(dir, 'data'),5);
  try {
    const a = store.createSubject({ name: 'Preservar', color: 'sage' }), vault = new Vault(store); vault.selectRoot(root);
    const note = vault.create({ subjectId: a.id, title: 'Nota' }); vault.draft({ id: note.ref.id, hash: note.hash, text: note.text + '\nRascunho' });
    new Desks(store).save({ subjectId: a.id, noteId: note.ref.id, page: 7, split: 62 }); const original = fs.readFileSync(path.join(root, note.ref.path));
    new Game(store); const game={coins:60}; const desk = new Desks(store).get(a.id);
    // Produce a real v3 schema in the isolated fixture, never touch a user's DB.
    store.db.exec('DROP TABLE card_reviews; DROP TABLE flashcards; DROP TABLE pdf_marks; DROP TABLE video_moments; DROP TABLE note_links; ALTER TABLE desks DROP COLUMN video_id; ALTER TABLE desks DROP COLUMN material_view; DROP TABLE videos; PRAGMA user_version=3;'); store.close(); store = new Store(path.join(dir, 'data'));
    assert.equal(store.db.prepare('PRAGMA user_version').get()!.user_version, 7);
    assert.deepEqual(new Desks(store).get(a.id), desk); assert.deepEqual(fs.readFileSync(path.join(root, note.ref.path)), original);
    assert.equal(new Vault(store).open(note.ref.id).draft!.text, note.text + '\nRascunho'); assert.equal(new Game(store).get().coins, game.coins);
  } finally { store.close(); }
});

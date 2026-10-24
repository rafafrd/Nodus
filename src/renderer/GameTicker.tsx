import { useEffect, useMemo, useState } from 'react';
import { dec } from '../shared/amount';
import type { GameState } from '../shared/game';

// Own lines (GAM-06), unlocked by progress. Nothing here is copied from another game.
const LINES: { when(s: GameState): boolean; text: string }[] = [
  { when: () => true, text: 'Observatório do Vale abre as portas. Visitantes perguntam o que exatamente é observado. Resposta: "tudo, aos poucos".' },
  { when: () => true, text: 'Previsão do tempo: céu limpo, com chance de ideias isoladas no fim da tarde.' },
  { when: s => s.engine.clicks >= 10, text: 'Moradores relatam um zumbido agradável vindo do núcleo. Ninguém reclamou.' },
  { when: s => s.engine.clicks >= 200, text: 'Fisioterapeuta local recomenda alternar a mão do clique. A cidade agradece o conselho.' },
  { when: s => s.engine.clicks >= 2000, text: 'Núcleo eleito "objeto mais tocado do vale" pelo terceiro ano seguido.' },
  { when: s => (s.economy.producers.collectors ?? 0) >= 1, text: 'Primeiro Coletor contratado. Chega com uma caixa vazia e muita vontade.' },
  { when: s => (s.economy.producers.collectors ?? 0) >= 25, text: 'Coletores fundam sindicato das caixas bem etiquetadas. Primeira pauta: etiquetas maiores.' },
  { when: s => (s.economy.producers.workshops ?? 0) >= 1, text: 'Oficina abre na rua de baixo. Promete juntar peças comuns de jeitos incomuns.' },
  { when: s => (s.economy.producers.workshops ?? 0) >= 10, text: 'Oficinas registram recorde de parafusos que sobraram. Especialistas dizem que é normal.' },
  { when: s => (s.economy.producers.warehouses ?? 0) >= 1, text: 'Armazém novo tem um corredor só para coisas que "podem ser úteis um dia".' },
  { when: s => (s.economy.producers.powerplants ?? 0) >= 1, text: 'Central liga as turbinas. As lâmpadas da praça piscam em aprovação.' },
  { when: s => (s.economy.producers.observatories ?? 0) >= 1, text: 'Primeiro observatório aponta para o céu. O céu, educado, não comenta.' },
  { when: s => (s.economy.producers['spectral-labs'] ?? 0) >= 1, text: 'Laboratório espectral detecta uma cor nova. Ainda sem nome; sugestões na prefeitura.' },
  { when: s => (s.economy.producers.automata ?? 0) >= 1, text: 'Tramas autômatas tiram a primeira pausa programada. Produtividade sobe, inexplicavelmente.' },
  { when: s => (s.economy.producers['orbital-beacons'] ?? 0) >= 1, text: 'Baliza orbital envia o primeiro sinal: "tudo certo por aqui, e com vocês?"' },
  { when: s => (s.economy.producers['impossible-council'] ?? 0) >= 1, text: 'O Conselho do impossível aprova a própria existência por unanimidade.' },
  { when: s => dec(s.economy.lifetime).gte(1000), text: 'Mil centelhas produzidas. A cidade comemora acendendo, adivinhe, uma centelha.' },
  { when: s => dec(s.economy.lifetime).gte(1e6), text: 'Economistas do vale tentam medir um milhão de centelhas. Desistem, encantados.' },
  { when: s => dec(s.economy.lifetime).gte(1e9), text: 'Bilhão de centelhas: a cidade é vista do espaço como um pontinho levemente animado.' },
  { when: s => dec(s.economy.lifetime).gte(1e12), text: 'O total produzido já não cabe na placa da entrada. Placa nova encomendada em notação científica.' },
  { when: s => s.economy.events >= 1, text: 'Lampejo visto sobre a praça. Testemunhas juram que ele piscou de volta.' },
  { when: s => s.economy.events >= 10, text: 'Clube dos observadores de Lampejos ganha sede própria e cadeiras muito confortáveis.' },
  { when: s => s.garden.unlocked, text: 'Horta comunitária inaugurada. A flor-de-orvalho ganhou o concurso de "planta mais calma".' },
  { when: s => s.economy.harvested >= 10, text: 'Feira da Horta registra fila para o trigo-luz. Ninguém sabe ao certo como se come luz.' },
  { when: s => s.council.unlocked, text: 'Conselho toma posse. Primeira deliberação: decidir como deliberar.' },
  { when: s => s.council.seats.some(Boolean), text: 'Nova pauta aprovada no Conselho. A ata tem três páginas e um desenho de nuvem.' },
  { when: s => s.economy.rounds >= 1, text: 'Memória de Conceitos vira assunto no café: "vetor tem direção, mas e o sentido da vida?"' },
  { when: s => s.economy.achievements.length >= 25, text: 'Arquivo de descobertas precisa de uma estante nova. A estante também foi descoberta.' },
  { when: s => s.economy.cycles >= 1, text: 'A cidade recomeça, mas lembra de tudo. Habitantes descrevem a sensação como "déjà-vu produtivo".' },
  { when: s => s.atmosphere === 'night', text: 'Toque de recolher? Não aqui. As luzes da vila preferem a noite.' },
  { when: s => s.skin === 'cyberpunk', text: 'Néon novo no centro. Os pombos aprovaram a iluminação.' },
  { when: s => s.skin === 'newyork', text: 'Brownstones chegam ao vale. Os vizinhos estranham as escadas de incêndio, mas gostam.' },
];
export function GameTicker({ state }: { state: GameState }) {
  const available = useMemo(() => LINES.filter(line => line.when(state)).map(line => line.text), [state]);
  const [index, setIndex] = useState(0);
  useEffect(() => { const timer = setInterval(() => setIndex(i => i + 1), 10000); return () => clearInterval(timer); }, []);
  const text = available[(available.length - 1 - index % available.length + available.length) % available.length];
  // Newest unlocked line first, then the rest in rotation; live region off so screen readers are not interrupted.
  return <p className="game-ticker" aria-live="off"><span>NOTÍCIAS DO VALE</span><span key={index} className="game-ticker-line">{text}</span></p>;
}

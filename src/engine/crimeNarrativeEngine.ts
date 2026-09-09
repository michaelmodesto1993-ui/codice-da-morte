import { CardMethod, CardObject, Player } from '../types/game';

interface MethodClue {
  sensoryClue: string; // E.g. "Uma testemunha ouviu um barulho seco vindo da sala pouco antes da morte."
  forensicNote?: string;
}

interface ObjectClue {
  physicalClue: string; // E.g. "Sobre o chão, havia um pequeno objeto metálico, pesado e fora do lugar."
  situationalClue: string; // E.g. "Um antigo documento apresentava sinais de ter sido recentemente fechado e manipulado."
  mysteryDetail: string; // E.g. "Ninguém soube explicar por que Augusto guardava tantos documentos cuidadosamente selados."
}

// ----------------------------------------------------------------------------
// METHOD CLUES (M01 to M60) - Sensory, witness, medical and forensic hints
// Never names the method directly; describes sensations, sounds, and traces.
// ----------------------------------------------------------------------------
const METHOD_CLUES: Record<string, MethodClue> = {
  // M01 Asfixia Silenciosa
  M01: {
    sensoryClue: 'Não havia ferimentos visíveis no corpo, mas a expressão da vítima revelava um desespero mudo pela falta de ar.',
  },
  // M02 Envenenamento Lento
  M02: {
    sensoryClue: 'Criados relataram que a vítima vinha sofrendo de fraqueza gradual, náuseas e uma palidez anormal nas horas que antecederam o fim.',
  },
  // M03 Queda Induzida
  M03: {
    sensoryClue: 'Um som repentino de tropeço e uma madeira que rangeu no topo do desnível foram os únicos ruídos antes do silêncio.',
  },
  // M04 Choque Elétrico
  M04: {
    sensoryClue: 'Um estalo seco ecoou na penumbra e um cheiro passageiro de ozônio chamuscado impregnou o corredor.',
  },
  // M05 Sugestão Fatal
  M05: {
    sensoryClue: 'A vítima parecia perturbada nos últimos dias, murmurando sobre mensagens e ordens sussurradas que a atormentavam.',
  },
  // M06 Estrangulamento
  M06: {
    sensoryClue: 'Marcas avermelhadas e lineares circundavam o pescoço, indicando que a respiração foi cortada por trás de forma súbita.',
  },
  // M07 Ingestão de Tinta
  M07: {
    sensoryClue: 'Vestígios escuros e viscosos nos lábios e uma tonalidade cinzenta na pele sugeriam o consumo forçado de um fluido químico denso.',
  },
  // M08 Exposição ao Frio
  M08: {
    sensoryClue: 'A pele da vítima estava gélida e arroxeada, indicando horas de confinamento sob uma temperatura congelante.',
  },
  // M09 Trauma Craniano
  M09: {
    sensoryClue: 'O exame revelou um golpe violento e concentrado na cabeça, desferido sem que a vítima tivesse tempo de esboçar defesa.',
  },
  // M10 Sufocamento por Pó
  M10: {
    sensoryClue: 'Uma tosse sufocada foi abafada pelo silêncio da noite, e partículas finas cobriam as vias respiratórias da vítima.',
  },
  // M11 Queimadura de Óleo
  M11: {
    sensoryClue: 'Um forte cheiro de óleo aquecido e marcas de queimadura química foram notados sobre as vestes e a pele.',
  },
  // M12 Compressão Torácica
  M12: {
    sensoryClue: 'Havia indícios de uma pressão esmagadora sobre o tórax, que impediu qualquer tentativa de respirar ou gritar.',
  },
  // M13 Vapor Tóxico
  M13: {
    sensoryClue: 'Um cheiro pungente e irritante ainda pairava no ar fechado, fazendo arder os olhos dos primeiros que entraram.',
  },
  // M14 Desorientação Fatal
  M14: {
    sensoryClue: 'Ilusões de ótica e sombras vacilantes parecem ter feito a vítima perder o equilíbrio e dar um passo cego no escuro.',
  },
  // M15 Corte Preciso
  M15: {
    sensoryClue: 'Uma incisão milimétrica e cirúrgica perto de uma artéria vital fez com que as forças se esvaíssem quase sem ruído.',
  },
  // M16 Hipotermia Induzida
  M16: {
    sensoryClue: 'O ar gélido e sem correntes do compartimento reduziu gradativamente a temperatura do corpo até a paralisia final.',
  },
  // M17 Inalação de Fumaça
  M17: {
    sensoryClue: 'O cômodo estava impregnado de uma fumaça densa e acre que cobriu as paredes de fuligem e asfixiou a vítima.',
  },
  // M18 Paralisia por Toxina
  M18: {
    sensoryClue: 'A vítima parecia ter permanecido consciente mas completamente imóvel enquanto suas funções vitais cessavam uma a uma.',
  },
  // M19 Impacto Contundente (EXATO DO EXEMPLO DO USUÁRIO)
  M19: {
    sensoryClue: 'Uma testemunha ouviu um barulho seco vindo da sala pouco antes da morte.',
  },
  // M20 Privação Sensorial
  M20: {
    sensoryClue: 'O confinamento em escuridão e silêncio absolutos provocou um colapso repentino na mente da vítima.',
  },
  // M21 Afogamento Seco
  M21: {
    sensoryClue: 'A vítima apresentava espasmos respiratórios severos e resíduos aquosos nos cantos dos lábios.',
  },
  // M22 Choque Térmico
  M22: {
    sensoryClue: 'A transição extrema e violenta entre um calor sufocante e o vento gélido da noite paralisou os batimentos da vítima.',
  },
  // M23 Sobrecarga Neural
  M23: {
    sensoryClue: 'Um estímulo perturbador e proibido entre os documentos parece ter levado os sentidos da vítima a um colapso fulminante.',
  },
  // M24 Esmagamento
  M24: {
    sensoryClue: 'Um estrondo monumental e abafado ecoou na estrutura momentos antes de o corpo ser encontrado.',
  },
  // M25 Sufocamento por Tecido
  M25: {
    sensoryClue: 'Fibras finas presas aos lábios indicavam que algo pesado e macio fora pressionado com força implacável sobre seu rosto.',
  },
  // M26 Intoxicação por Solvente
  M26: {
    sensoryClue: 'Uma névoa química de vapores voláteis causou tontura imediata e perda irreversível de consciência.',
  },
  // M27 Queda de Prateleira
  M27: {
    sensoryClue: 'O som de madeiras estalando e prateleiras tombando em cadeia ecoou pelos corredores adjacentes.',
  },
  // M28 Choque por Fio Descascado
  M28: {
    sensoryClue: 'Pequenas queimaduras pontuais na palma da mão sugerem contato involuntário com uma condução elétrica traiçoeira.',
  },
  // M29 Sugestão de Pânico
  M29: {
    sensoryClue: 'Passos desesperados e respiração entrecortada foram ouvidos momentos antes de o silêncio fúnebre tomar conta.',
  },
  // M30 Estrangulamento por Corda
  M30: {
    sensoryClue: 'Um sulco fino e profundo na garganta denunciava que uma laçada resistente fora apertada com precisão letal.',
  },
  // M31 Ingestão de Pó Tóxico
  M31: {
    sensoryClue: 'Resíduos de um pó fino no fundo de um recipiente deixado à mostra indicavam que algo fora misturado secretamente.',
  },
  // M32 Exposição Prolongada ao Frio
  M32: {
    sensoryClue: 'A ausência prolongada de vestes adequadas no subsolo congelado fez com que o corpo sucumbisse ao rigor da noite.',
  },
  // M33 Golpe na Nuca
  M33: {
    sensoryClue: 'Um ataque traiçoeiro e seco na base do crânio neutralizou a vítima antes de qualquer chance de reação.',
  },
  // M34 Sufocamento por Nuvem de Pó
  M34: {
    sensoryClue: 'Uma nuvem espessa de partículas secas fora soprada no ambiente fechado, bloqueando instantaneamente a respiração.',
  },
  // M35 Queimadura por Lâmpada
  M35: {
    sensoryClue: 'Vidros estilhaçados e marcas de combustão rápida espalharam um forte odor de fluido queimado pelo chão.',
  },
  // M36 Compressão por Volumes
  M36: {
    sensoryClue: 'O desabamento repentino de uma pilha monumental de tratados aprisionou a vítima sob peso desmedido.',
  },
  // M37 Inalação de Vapor de Restauração
  M37: {
    sensoryClue: 'Gases ácidos de conservação acumulados no cômodo sem janelas provocaram irritação imediata e colapso respiratório.',
  },
  // M38 Labirinto Mental
  M38: {
    sensoryClue: 'A vítima parece ter percorrido em círculos os corredores sombrios até desfalecer por completo em exaustão e terror.',
  },
  // M39 Corte com Lâmina Fina
  M39: {
    sensoryClue: 'Uma incisão cirúrgica e limpa provocou sangramento interno contínuo sem que se ouvisse um único lamento.',
  },
  // M40 Congelamento Controlado
  M40: {
    sensoryClue: 'Cristais de gelo cobriam as fechaduras da câmara, onde o ar rarefeito e gélido preservava o corpo prostrado.',
  },
  // M41 Fumaça de Papel Queimado
  M41: {
    sensoryClue: 'Cinzas leves flutuavam no ar e um odor acre de combustão lenta revelava que o oxigênio havia sido consumido.',
  },
  // M42 Toxina de Planta Antiga
  M42: {
    sensoryClue: 'Um extrato vegetal amargo agiu de forma fulminante, provocando dormência imediata e parada cardiorrespiratória.',
  },
  // M43 Impacto de Atlas
  M43: {
    sensoryClue: 'Um golpe contundente e pesado vindo de cima desferiu um impacto que derrubou a vítima contra o chão.',
  },
  // M44 Isolamento Total
  M44: {
    sensoryClue: 'Enclausurada em um compartimento com isolamento acústico, a vítima não pôde ser ouvida por ninguém que passava perto.',
  },
  // M45 Líquido nas Vias Aéreas
  M45: {
    sensoryClue: 'Pequenas poças salpicadas e marcas úmidas ao redor das narinas denunciavam uma breve e sufocada resistência.',
  },
  // M46 Mudança Brusca de Temperatura
  M46: {
    sensoryClue: 'O choque repentino entre o calor abrasador do forno e a nevasca exterior paralisou os reflexos da vítima.',
  },
  // M47 Excesso de Informação do Códice
  M47: {
    sensoryClue: 'A leitura de um segredo estarrecedor parece ter provocado um choque emocional devastador, paralisando o coração.',
  },
  // M48 Desabamento de Estante
  M48: {
    sensoryClue: 'Pinos de retenção afrouxados deliberadamente fizeram a armação de madeira desabar com violência sobre o piso.',
  },
  // M49 Asfixia por Tecido Úmido
  M49: {
    sensoryClue: 'Fibras empapadas e umidade residual na face comprovavam que a respiração fora impedida por um pano umedecido.',
  },
  // M50 Envenenamento por Tinta Concentrada
  M50: {
    sensoryClue: 'Pigmentos escuros absorvidos pela pele deixaram manchas anormais sob as pontas dos dedos e nos lábios.',
  },
  // M51 Empurrão na Escadaria
  M51: {
    sensoryClue: 'Um ruído seco de passos apressados seguido de uma perda súbita de equilíbrio ecoou pela escadaria espiral.',
  },
  // M52 Curto-Circuito Fatal
  M52: {
    sensoryClue: 'Uma centelha elétrica veloz saltou na escuridão, atingindo o corpo com descarga de alta intensidade.',
  },
  // M53 Hipnose Profunda
  M53: {
    sensoryClue: 'A vítima encontrava-se em um estado imóvel e catatônico de sugestão antes do suspiro derradeiro.',
  },
  // M54 Estrangulamento por Fita
  M54: {
    sensoryClue: 'Uma fita resistente e fina deixou uma marca horizontal contínua na garganta, cortando a circulação com extrema firmeza.',
  },
  // M55 Ingestão de Solvente
  M55: {
    sensoryClue: 'A xícara ao lado exalava um cheiro químico e cáustico, revelando que a bebida continha uma mistura fatal.',
  },
  // M56 Noite no Arquivo Frio
  M56: {
    sensoryClue: 'A tranca da sala emperrou durante a tempestade, e as correntes de ar glacial consumiram o calor do corpo.',
  },
  // M57 Golpe com Peso de Papel
  M57: {
    sensoryClue: 'Um impacto maciço e repentino na cabeça causou o colapso instantâneo sem qualquer tempo para defesa.',
  },
  // M58 Nuvem de Pó de Restauração
  M58: {
    sensoryClue: 'Uma nuvem de conservante irritante fora soprada contra o rosto, induzindo tosse incontrolável e asfixia.',
  },
  // M59 Queimadura de Cera Quente
  M59: {
    sensoryClue: 'Gotas de substância fervente e viscosa endurecidas sobre a pele revelavam um momento de desespero e agonia.',
  },
  // M60 Esmagamento por Caixa de Arquivo
  M60: {
    sensoryClue: 'Um baú de madeira reforçada precipitou-se de uma altura considerável, causando traumatismo demolidor.',
  },
};

// ----------------------------------------------------------------------------
// OBJECT CLUES (O01 to O64) - Physical, environmental and contextual traces
// Never names the card directly; describes materials, positions, and context.
// ----------------------------------------------------------------------------
const OBJECT_CLUES: Record<string, ObjectClue> = {
  // O01 Caneta de Pena
  O01: {
    physicalClue: 'Sobre o chão, uma haste fina com ponta metálica aguçada repousava manchada de fluido escuro.',
    situationalClue: 'Rascunhos de correspondência inacabados exibiam rabiscos trêmulos ao lado de onde a mão tombou.',
    mysteryDetail: 'Ninguém soube explicar por que a vítima redigia com tanta urgência no meio da noite.',
  },
  // O02 Cordão de Cortina
  O02: {
    physicalClue: 'Um cordão grosso trançado com pingente pesado havia sido arrancado do dossel das janelas.',
    situationalClue: 'Uma das pesadas cortinas estava caída de lado, com o tecido desfiado e retorcido.',
    mysteryDetail: 'Criados estranharam encontrar as tapeçarias abertas em plena ventania noturna.',
  },
  // O03 Volume do Códice
  O03: {
    physicalClue: 'Um tomo ancestral encadernado em couro grosso jazia tombado com a lombada estalada no piso.',
    situationalClue: 'Suas páginas densas continham marcas de dedos apressados e pequenos vincos recentes.',
    mysteryDetail: 'Curiosos se perguntavam por que aquele exemplar proibido havia sido retirado do púlpito secreto.',
  },
  // O04 Lâmpada de Óleo
  O04: {
    physicalClue: 'Uma lamparina de latão estava caída de lado, derramando um rastro gorduroso e combustível pelo assoalho.',
    situationalClue: 'O pavio ainda soltava uma tênue fita de fumaça cinzenta quando os primeiros nobres chegaram.',
    mysteryDetail: 'Ninguém entendeu por que aquela fonte de luz havia sido levada para um aposento já iluminado.',
  },
  // O05 Chave de Ferro
  O05: {
    physicalClue: 'Uma chave mestra pesada e ornamentada de ferro forjado foi localizada no canto escuro da sala.',
    situationalClue: 'A fechadura da porta mestra apresentava arranhões recentes, indicando uma tentativa de trancamento rápido.',
    mysteryDetail: 'O guardião jurava que a chave estivera trancada em seu chaveiro até o cair da tarde.',
  },
  // O06 Frasco de Tinta
  O06: {
    physicalClue: 'Um recipiente de vidro escuro e opaco estava destampado, deixando uma poça densa e viscosa pelo tapete.',
    situationalClue: 'Marcas circulares escuras foram encontradas na borda de uma xícara deixada sobre a mesa.',
    mysteryDetail: 'Familiares não compreendiam por que aquele frasco de extrato denso estava fora da bancada.',
  },
  // O07 Lupa de Aumento
  O07: {
    physicalClue: 'Uma lente convexa com aro de bronze repousava no piso, refletindo de modo distorcido a penumbra da sala.',
    situationalClue: 'A superfície do vidro apresentava marcas de dedos na armação metálica.',
    mysteryDetail: 'Testemunhas notaram que a vítima passara a tarde examinando detalhes minúsculos antes de ser surpreendida.',
  },
  // O08 Fita de Marcação
  O08: {
    physicalClue: 'Uma fita de veludo carmesim, rompida com violência, estava jogada sob a poltrona.',
    situationalClue: 'A fita mantinha a forma de um laço tenso, com pequenos nós desfeitos nas extremidades.',
    mysteryDetail: 'Membros da mesa questionavam por que a fita que marcava o capítulo secreto fora arrancada.',
  },
  // O09 Estátua de Bronze
  O09: {
    physicalClue: 'Uma miniatura maciça de bronze em formato de gárgula estava tombada fora de seu pedestal.',
    situationalClue: 'A base da peça exibia pequenas marcas de atrito recente contra o piso de carvalho.',
    mysteryDetail: 'Nenhum criado compreendeu como uma peça tão sólida e pesada pôde se deslocar da prateleira.',
  },
  // O10 Páginas Soltas
  O10: {
    physicalClue: 'Folhas cortantes de pergaminho amarelado estavam espalhadas de modo caótico ao redor do corpo.',
    situationalClue: 'As bordas afiadas dos papéis continham pequenos vincos feitos com pressa evidente.',
    mysteryDetail: 'Comentava-se nos corredores que o conteúdo daquelas folhas comprometia figuras influentes da corte.',
  },
  // O11 Tesoura de Restauração
  O11: {
    physicalClue: 'Uma tesoura fina de lâminas aguçadas e cabo prateado foi achada entre os papéis da escrivaninha.',
    situationalClue: 'O metal frio exibia vestígios de ter sido limpo às pressas em uma das lâminas.',
    mysteryDetail: 'O arquivista garantiu que aquele instrumento cirúrgico nunca saía do estojo de veludo.',
  },
  // O12 Peso de Papel
  O12: {
    physicalClue: 'Sobre o chão, havia um globo maciço e pesado de vidro esculpido, fora de sua posição habitual.',
    situationalClue: 'A superfície lisa do artefato mostrava sinais de ter sido empunhada com firmeza.',
    mysteryDetail: 'Ninguém soube explicar por que um adorno tão pesado fora deixado tão perto da vítima.',
  },
  // O13 Corda de Encadernação
  O13: {
    physicalClue: 'Um pedaço de fio grosso de cânhamo encerado estava solto no assoalho, com nós desfeitos.',
    situationalClue: 'Fibras ásperas haviam se desprendido sobre o estofamento da cadeira próxima.',
    mysteryDetail: 'Todos sabiam que aquele material resistente era utilizado exclusivamente nas oficinas do subsolo.',
  },
  // O14 Frasco de Solvente
  O14: {
    physicalClue: 'Um vidro graduado com resíduo volátil de substância ácida encontrava-se tombado sem a rolha.',
    situationalClue: 'Um rastro corrosivo descoloriu levemente o verniz da madeira onde algumas gotas caíram.',
    mysteryDetail: 'Murmurava-se que frascos daquele teor só eram manuseados sob rigorosa autorização.',
  },
  // O15 Lanterna de Mão
  O15: {
    physicalClue: 'Uma lanterna cilíndrica de ferro com vidro fosco jazia apagada junto aos pés da vítima.',
    situationalClue: 'O fecho de metal estava emperrado, indicando que sofrera um choque mecânico repentino.',
    mysteryDetail: 'Estranhava-se o fato de alguém caminhar com lanterna em uma ala já provida de tochas.',
  },
  // O16 Martelo de Encadernador
  O16: {
    physicalClue: 'Um martelo de cabeça chata em carvalho e ferro encontrava-se caído entre duas pilhas de manuscritos.',
    situationalClue: 'A madeira do cabo exibia marcas de manuseio recente e marcas de impacto na face metálica.',
    mysteryDetail: 'Nenhum restaurador justificou a presença da ferramenta pesada fora da oficina de couro.',
  },
  // O17 Cadeado Antigo
  O17: {
    physicalClue: 'Uma trava pesada de ferro fundido com segredo de letras estava aberta e caída no carpete.',
    situationalClue: 'A argola de metal continha pequenas ranhuras que indicavam força excessiva para abertura.',
    mysteryDetail: 'O conteúdo da gaveta que o cadeado guardava havia desaparecido misteriosamente.',
  },
  // O18 Pano de Limpeza
  O18: {
    physicalClue: 'Uma flanela manchada de fuligem e reagentes químicos estava amassada debaixo da poltrona.',
    situationalClue: 'O tecido ainda conservava umidade e um odor desagradável concentrado em suas dobras.',
    mysteryDetail: 'Ninguém entendeu quem trouxera aquele retalho de pano para um aposento tão requintado.',
  },
  // O19 Régua de Metal
  O19: {
    physicalClue: 'Uma lâmina retangular e rígida de metal milimetrado estava caída com a borda virada para cima.',
    situationalClue: 'O canto aguçado da peça apresentava um leve amassado decorrente de choque forte.',
    mysteryDetail: 'Colegas comentavam que a vítima jamais deixava seus instrumentos de medição fora do estojo.',
  },
  // O20 Caixa de Madeira
  O20: {
    physicalClue: 'Uma caixa entalhada de nogueira com fecho secreto estava escancarada sobre o aparador.',
    situationalClue: 'O compartimento interno aveludado estava vazio, com marcas de arranhões no forro.',
    mysteryDetail: 'Perguntavam-se o que de tão valioso repousava dentro daquela caixa antes do crime.',
  },
  // O21 Espelho de Mão
  O21: {
    physicalClue: 'Um espelho prateado com cabo ornamentado jazia virado contra a laje de pedra.',
    situationalClue: 'A superfície prateada estava coberta por uma névoa condensada de respiração.',
    mysteryDetail: 'Diziam que aquele espelho pertencia à ala antiga e nunca deveria ter saído de lá.',
  },
  // O22 Garrafa de Água
  O22: {
    physicalClue: 'Uma garrafa de vidro verde selada com cortiça estava tombada com líquido entornado pelo tapete.',
    situationalClue: 'A cortiça apresentava marcas de perfuração fina, sugerindo que algo fora injetado antes.',
    mysteryDetail: 'A vítima tinha o hábito estrito de beber apenas água retirada da fonte reservada.',
  },
  // O23 Luvas de Couro
  O23: {
    physicalClue: 'Um par de luvas reforçadas de couro escuro fora abandonado sob uma banqueta.',
    situationalClue: 'As pontas dos dedos das luvas estavam impregnadas de resíduos e poeira densa.',
    mysteryDetail: 'Quem as usou pretendia claramente não deixar vestígios digitais pela sala.',
  },
  // O24 Fio de Cobre
  O24: {
    physicalClue: 'Pedaços delgados de fio condutor com brilho avermelhado estavam desenrolados no chão.',
    situationalClue: 'As pontas desencapadas do metal exibiam sinais de aquecimento pontual recente.',
    mysteryDetail: 'Ninguém compreendeu por que as instalações elétricas haviam sido mexidas antes do blecaute.',
  },
  // O25 Pó de Restauração
  O25: {
    physicalClue: 'Um frasco aberto continha um pó branco e volátil que cobria a madeira da mesa como fina geada.',
    situationalClue: 'Marcas de tosse e impressões digitais borradas desfaziam a uniformidade do pó.',
    mysteryDetail: 'A substância de conservação deveria estar trancada no armário químico do laboratório.',
  },
  // O26 Candelabro
  O26: {
    physicalClue: 'Uma peça maciça de prata fosca com cinco braços estava tombada na penumbra.',
    situationalClue: 'As velas de cera negra estavam apagadas e quebradas na base dos suportes metálicos.',
    mysteryDetail: 'As chamas daquele candelabro eram as únicas que costumavam arder durante a vigília.',
  },
  // O27 Mapa Enrolado
  O27: {
    physicalClue: 'Um tubo cilíndrico de chumbo com uma carta náutica aberta repousava ao lado da poltrona.',
    situationalClue: 'O pergaminho desenrolado continha anotações em tinta vermelha marcando rotas de fuga.',
    mysteryDetail: 'Aquele mapa antigo mostrava as passagens subterrâneas lacradas desde o último século.',
  },
  // O28 Selo de Cera (EXATO CONTEXTO)
  O28: {
    physicalClue: 'Sobre o chão, havia um pequeno carimbo de sinete com resíduos de cera avermelhada.',
    situationalClue: 'Um antigo documento apresentava sinais de ter sido recentemente fechado e manipulado.',
    mysteryDetail: 'Ninguém soube explicar por que tantos documentos estavam cuidadosamente selados com cera recente.',
  },
  // O29 Agulha de Encadernação
  O29: {
    physicalClue: 'Uma agulha longa de aço temperado com ponta fina jazia cravada numa fresta do assoalho.',
    situationalClue: 'Um fragmento de fio de seda ainda passava pelo orifício da haste de metal.',
    mysteryDetail: 'Ferramentas de costura pesada não pertenciam àquele aposento nobre de audiências.',
  },
  // O30 Vaso de Cerâmica
  O30: {
    physicalClue: 'Cacos de barro cozido com inscrições antigas estavam espalhados em leque perto da porta.',
    situationalClue: 'Resíduos de terra seca e pequenas cinzas se misturavam aos fragmentos quebrados.',
    mysteryDetail: 'A ânfora ornamental era uma relíquia guardada a sete chaves pela família.',
  },
  // O31 Tinta Concentrada
  O31: {
    physicalClue: 'Uma pequena ampola de vidro com pigmento negro concentrado estava quebrada sob a mesa.',
    situationalClue: 'Um aroma metálico e penetrante emanava da mancha que cobria o assoalho.',
    mysteryDetail: 'O uso daquele pigmento raro fora banido da oficina devido à sua alta toxicidade.',
  },
  // O32 Corrente de Prata
  O32: {
    physicalClue: 'Uma corrente de elos grossos de prata com um fecho arrebentado repousava junto ao corpo.',
    situationalClue: 'A peça parecia ter sido arrancada com violência do pescoço ou do relógio de bolso.',
    mysteryDetail: 'A insígnia de família que pendia daquela corrente desapareceu sem deixar rastro.',
  },
  // O33 Livro Pesado
  O33: {
    physicalClue: 'Um atlas enciclopédico de encadernação maciça e cantoneiras de metal estava aberto no piso.',
    situationalClue: 'O peso descomunal do volume amassou as folhas soltas sobre as quais caiu.',
    mysteryDetail: 'Apenas leitores com autorização expressa podiam manusear livros de tamanho porte.',
  },
  // O34 Lente Queimada
  O34: {
    physicalClue: 'Um fragmento circular de vidro com marcas densas de fuligem negra foi achado perto do rodapé.',
    situationalClue: 'As bordas do vidro mostravam sinais de exposição a chamas de alta temperatura.',
    mysteryDetail: 'Ninguém encontrou o aparelho de projeção ao qual aquela lente especial pertencia.',
  },
  // O35 Saco de Linho
  O35: {
    physicalClue: 'Uma bolsa opaca de linho cru com cordão corrediço estava jogada no canto da sala.',
    situationalClue: 'O tecido apresentava vincos e dobras como se tivesse sido amarrado às pressas.',
    mysteryDetail: 'Suspeita-se que o saco tenha sido trazido para carregar objetos roubados do recinto.',
  },
  // O36 Parafuso de Prateleira
  O36: {
    physicalClue: 'Um pino metálico com rosca sabotada estava caído ao lado de uma das colunas de apoio.',
    situationalClue: 'A furação na madeira mostrava que a peça de sustentação havia sido forçada para soltar-se.',
    mysteryDetail: 'O conserto daquela estante fora solicitado naquela mesma tarde ao carpinteiro da abadia.',
  },
  // O37 Pena de Ganso
  O37: {
    physicalClue: 'Uma pena longa com a ponta cortada e enegrecida foi encontrada caída atrás da poltrona.',
    situationalClue: 'A haste exibia gotas ressecadas de um fluido de odor acre e desconhecido.',
    mysteryDetail: 'A caligrafia nos papéis sugeria que outra pessoa estivera escrevendo minutos antes.',
  },
  // O38 Corda de Veludo
  O38: {
    physicalClue: 'Um cordão vermelho de veludo com fecho de latão estava caído transversalmente no corredor.',
    situationalClue: 'O tecido apresentava marcas de tensão e esgarçamento em uma das extremidades.',
    mysteryDetail: 'A corda costumava isolar o acesso à galeria dos arquivos proibidos.',
  },
  // O39 Tomos Empilhados
  O39: {
    physicalClue: 'Uma coluna de grossos volumes encadernados havia desmoronado perto da escrivaninha.',
    situationalClue: 'A amarração de cordão que mantinha os livros unidos fora cortada propositalmente.',
    mysteryDetail: 'Os tomos cobriam exatamente o local onde papéis confidenciais deveriam estar guardados.',
  },
  // O40 Lamparina de Bronze
  O40: {
    physicalClue: 'Um queimador antigo de azeite com mecha de algodão chamuscada estava tombado sob a estante.',
    situationalClue: 'Gotículas de combustível ainda quentes formavam um rastro oleoso no carpete.',
    mysteryDetail: 'A lamparina pertencera a um antigo hóspede que partira dias antes sem despedidas.',
  },
  // O41 Chave do Arquivo
  O41: {
    physicalClue: 'Uma chave comprida de latão com dentes irregulares repousava sobre a mesa.',
    situationalClue: 'A chave pertencia à tranca da ala subterrânea, onde repousavam os relatórios antigos.',
    mysteryDetail: 'Apenas a vítima e o prior possuíam cópias daquela chave mestra restrita.',
  },
  // O42 Frasco de Pigmento
  O42: {
    physicalClue: 'Um pote de cerâmica com pó avermelhado estava quebrado, tingindo o piso de carmim.',
    situationalClue: 'Pegadas parciais de solas de sapatos marcavam o piso vermelho em direção à saída.',
    mysteryDetail: 'O pigmento mineral guardava propriedades corrosivas bem conhecidas pelos alquimistas.',
  },
  // O43 Lente de Aumento
  O43: {
    physicalClue: 'Uma lente ajustável de relojoeiro com aro de metal escuro foi encontrada próxima ao corpo.',
    situationalClue: 'O vidro continha marcas de suor frio e um pequeno arranhão na borda ótica.',
    mysteryDetail: 'Quem utilizava a lente procurava decifrar micro-inscrições deixadas nas margens dos códices.',
  },
  // O44 Fita de Seda
  O44: {
    physicalClue: 'Uma fita negra e lisa de seda com alta resistência mecânica estava embolada no chão.',
    situationalClue: 'As pontas da fita exibiam nós desfeitos com brutalidade e marcas de tração severa.',
    mysteryDetail: 'A fita era comumente usada para atar correspondências diplomáticas sigilosas.',
  },
  // O45 Busto de Mármore
  O45: {
    physicalClue: 'Uma escultura maciça da face de um nobre estava fora de prumo na mísula de pedra.',
    situationalClue: 'A quina da base de mármore continha vestígios de atrito contra o piso nobre.',
    mysteryDetail: 'A escultura pesava mais de vinte quilos e jamais havia sido movida do seu pedestal.',
  },
  // O46 Pergaminho Antigo
  O46: {
    physicalClue: 'Um rolo de couro curtido com margens afiadas estava desenrolado sobre a cadeira.',
    situationalClue: 'As linhas caligráficas continham nomes riscados com tinta ainda fresca.',
    mysteryDetail: 'O documento relacionava os bens que seriam partilhados entre os herdeiros presentes.',
  },
  // O47 Estilete de Restauração
  O47: {
    physicalClue: 'Uma pequena lâmina fina de aço, aguçada como navalha, estava caída na penumbra.',
    situationalClue: 'O cabo de madeira exibia pequenas marcas de pressão feitas por dedos firmes.',
    mysteryDetail: 'Aquele estilete de precisão era manuseado exclusivamente para remover lacres e selos.',
  },
  // O48 Esfera de Vidro
  O48: {
    physicalClue: 'Um globo transparente de vidro maciço rolou até parar junto ao batente da porta.',
    situationalClue: 'A esfera concentrava a luz tênue dos candelabros num ponto brilhante no assoalho.',
    mysteryDetail: 'O objeto costumava repousar sobre a mesa de mapas astronômicos da cúpula.',
  },
  // O49 Fio de Encadernação
  O49: {
    physicalClue: 'Um cabo fino de seda trançada com alma de aço estava esticado no rodapé.',
    situationalClue: 'O fio apresentava nós precisos feitos para suportar tração excessiva.',
    mysteryDetail: 'Ninguém soube dizer quem encomendou aquele tipo especial de fio reforçado.',
  },
  // O50 Solvente de Limpeza
  O50: {
    physicalClue: 'Um frasco com resíduo volátil de álcool etílico e éter estava sem vedação no aparador.',
    situationalClue: 'O líquido evaporava rapidamente, deixando uma mancha seca e esbranquiçada na madeira.',
    mysteryDetail: 'O produto não deveria estar em contato com livros de tintas sensíveis ao álcool.',
  },
  // O51 Lanterna de Óleo
  O51: {
    physicalClue: 'Uma lamparina de latão com quebra-vento de mica estava caída com a chama apagada.',
    situationalClue: 'O mecanismo de ajuste do pavio estava travado com força na posição máxima.',
    mysteryDetail: 'A lanterna fora vista pela última vez na mão de alguém que rondava a ala leste.',
  },
  // O52 Martelo Pequeno
  O52: {
    physicalClue: 'Um martelo delicado de relojoeiro repousava sobre uma pilha de notas fiscais.',
    situationalClue: 'A cabeça de ferro exibia pequenos amassados compatíveis com golpes repetidos.',
    mysteryDetail: 'A ferramenta fora furtada da oficina de relógios da abadia na véspera.',
  },
  // O53 Cadeado de Ferro
  O53: {
    physicalClue: 'Uma tranca blindada de ferro fundido exibia marcas de violação recente com gazua.',
    situationalClue: 'O corpo do cadeado estava aberto e caído junto ao baú das confissões.',
    mysteryDetail: 'O cofre que ele fechava guardava as cartas comprometedoras da corte.',
  },
  // O54 Pano Úmido
  O54: {
    physicalClue: 'Um pano úmido embebido em óleo de linhaça estava largado sobre a mesa.',
    situationalClue: 'O tecido desprendia vapores oleosos e marcas de dedos oleosos nas maçanetas.',
    mysteryDetail: 'O uso de óleo de linhaça era restrito aos restauradores de telas antigas.',
  },
  // O55 Régua de Bronze
  O55: {
    physicalClue: 'Uma barra rígida de bronze polido com peso considerável jazia atravessada no chão.',
    situationalClue: 'Uma das bordas metálicas continha marcas de impacto contra superfície dura.',
    mysteryDetail: 'A régua pertencia ao conjunto de instrumentos de arquitetura do palácio.',
  },
  // O56 Caixa de Arquivo
  O56: {
    physicalClue: 'Uma gaveta pesada de carvalho maciço com puxador de ferro fora retirada do armário.',
    situationalClue: 'Seu conteúdo de fichas estava desordenado e com pastas arrancadas.',
    mysteryDetail: 'O arquivo continha o histórico de condenações antigas do tribunal.',
  },
  // O57 Espelho Rachado
  O57: {
    physicalClue: 'Cacos pontiagudos de vidro prateado estavam espalhados em leque pelo tapete.',
    situationalClue: 'O espelho sofreu um impacto direto no centro antes de se estilhaçar.',
    mysteryDetail: 'Quem quebrou o espelho parecia tentar impedir que alguém visse seu reflexo.',
  },
  // O58 Cantil de Água
  O58: {
    physicalClue: 'Um cantil metálico com cheiro estranho de substância química repousava destampado.',
    situationalClue: 'Gotas de um líquido turvo escorriam pela rosca de metal até a toalha de mesa.',
    mysteryDetail: 'O cantil pertencia a um dos viajantes recém-chegados à abadia.',
  },
  // O59 Luvas de Restauração
  O59: {
    physicalClue: 'Um par de luvas de algodão fino impregnadas de pó químico estava embolado num canto.',
    situationalClue: 'As palmas das luvas estavam tingidas de pigmentos escuros e fuligem.',
    mysteryDetail: 'Quem as usou descartou-as às pressas antes de se juntar aos outros no salão.',
  },
  // O60 Fio Elétrico Antigo
  O60: {
    physicalClue: 'Um cabo com isolamento de tecido puído e cobre exposto estava enrolado na maçaneta.',
    situationalClue: 'Marcas de faíscas chamuscadas eram visíveis no batente metálico da porta.',
    mysteryDetail: 'A fiação havia sido puxada do quadro elétrico minutos antes do apagão.',
  },
  // O61 Pó Conservante
  O61: {
    physicalClue: 'Um vidro com mistura de bórax e cânfora estava tombado com o pó derramado.',
    situationalClue: 'A nuvem de partículas brancas ainda se assentava lentamente sobre a mobília.',
    mysteryDetail: 'A substância conservante era armazenada exclusivamente no sótão trancado.',
  },
  // O62 Candelabro de Ferro
  O62: {
    physicalClue: 'Um suporte pesado de vela de ferro forjado com ponta cônica estava caído no assoalho.',
    situationalClue: 'A cera derretida havia escorrido em formato irregular sobre a madeira fria.',
    mysteryDetail: 'Aquele tocheiro era o mais pesado do corredor e exigia duas mãos para ser erguido.',
  },
  // O63 Mapa da Biblioteca
  O63: {
    physicalClue: 'Uma planta baixa em papel vegetal com passagens secretas anotadas estava aberta na mesa.',
    situationalClue: 'Círculos em tinta vermelha indicavam a localização exata das portas ocultas.',
    mysteryDetail: 'Aquele mapa detalhado era de conhecimento exclusivo do arquiteto da abadia.',
  },
  // O64 Selo de Chumbo (EXATO DO EXEMPLO DO USUÁRIO)
  O64: {
    physicalClue: 'Sobre o chão, havia um pequeno objeto metálico, pesado e fora do lugar.',
    situationalClue: 'Um antigo documento apresentava sinais de ter sido recentemente fechado e manipulado.',
    mysteryDetail: 'Ninguém soube explicar por que Augusto guardava tantos documentos cuidadosamente selados.',
  },
};

/**
 * Procedural Dynamic Crime Narrative Generator.
 * Directly weaves the user's requested structural pattern:
 * 1. Victim & Scene introduction
 * 2. Physical & contextual traces of the Object (without naming it)
 * 3. Sensory, auditory, or medical traces of the Method (without naming it)
 * 4. Contextual mystery detail linking victim and circumstances
 * 5. Detective investigation conclusion: "Agora, os investigadores precisam descobrir o que realmente aconteceu naquela noite."
 */
export function generateDynamicCrimeNarrative(
  method?: CardMethod,
  object?: CardObject,
  killerPlayer?: Player,
  victimNameInput?: string
): string {
  // If exact combination is Impacto Contundente x Selo de Chumbo / Selo de Cera:
  // Render the canonical user masterpiece example!
  const methodName = method?.name?.toLowerCase() || '';
  const objectName = object?.name?.toLowerCase() || '';
  const isImpactoContundente = methodName.includes('impacto contundente') || method?.id === 'M19';
  const isSeloDeChumboOuCera = objectName.includes('selo') || object?.id === 'O64' || object?.id === 'O28';

  const victimName = victimNameInput || 'Augusto';

  if (isImpactoContundente && isSeloDeChumboOuCera) {
    return (
      `${victimName} foi encontrado morto em seu escritório, ao lado de uma mesa com papéis espalhados.\n` +
      `Sobre o chão, havia um pequeno objeto metálico, pesado e fora do lugar.\n` +
      `Um antigo documento apresentava sinais de ter sido recentemente fechado e manipulado.\n` +
      `Uma testemunha ouviu um barulho seco vindo da sala pouco antes da morte.\n` +
      `Ninguém soube explicar por que ${victimName} guardava tantos documentos cuidadosamente selados.\n` +
      `Agora, os investigadores precisam descobrir o que realmente aconteceu naquela noite.`
    );
  }

  // Retrieve or synthesize Object clues
  let objectClue = object ? OBJECT_CLUES[object.id] : undefined;
  if (!objectClue && object) {
    // Category-based / smart descriptor fallback
    objectClue = generateFallbackObjectClue(object, victimName);
  } else if (!objectClue) {
    objectClue = {
      physicalClue: 'Sobre o chão, havia um estranho pertence fora do lugar habitual.',
      situationalClue: 'Vestígios discretos indicavam que um item da sala fora manuseado com pressa antes do ocorrido.',
      mysteryDetail: `Ninguém soube explicar por que aquele elemento se encontrava tão perto de ${victimName}.`,
    };
  }

  // Retrieve or synthesize Method clues
  let methodClue = method ? METHOD_CLUES[method.id] : undefined;
  if (!methodClue && method) {
    methodClue = generateFallbackMethodClue(method);
  } else if (!methodClue) {
    methodClue = {
      sensoryClue: 'Uma testemunha nos corredores relatou ter percebido um movimento súbito e anormal momentos antes da quietude absoluta.',
    };
  }

  // Determine setting based on object/method
  const sceneLocation = determineSceneLocation(object, method);

  const line1 = `${victimName} foi encontrado morto em ${sceneLocation}, ao lado de uma mesa com papéis espalhados.`;
  const line2 = objectClue.physicalClue;
  const line3 = objectClue.situationalClue;
  const line4 = methodClue.sensoryClue;
  const line5 = objectClue.mysteryDetail.replace(/Augusto/g, victimName);
  const line6 = 'Agora, os investigadores precisam descobrir o que realmente aconteceu naquela noite.';

  return `${line1}\n${line2}\n${line3}\n${line4}\n${line5}\n${line6}`;
}

function determineSceneLocation(object?: CardObject, method?: CardMethod): string {
  const catObj = object?.category?.toLowerCase() || '';
  const catMeth = method?.category?.toLowerCase() || '';

  if (catObj.includes('documento') || catMeth.includes('psicológico')) {
    return 'seu escritório';
  }
  if (catObj.includes('recipiente') || catMeth.includes('químico')) {
    return 'sua bancada de estudos';
  }
  if (catMeth.includes('ambiental') || catObj.includes('iluminação')) {
    return 'seu aposento particular';
  }
  return 'seu escritório';
}

function generateFallbackObjectClue(object: CardObject, victimName: string): ObjectClue {
  const name = object.name;
  const cat = object.category || '';
  return {
    physicalClue: `Sobre o chão, um artefato da categoria ${cat.toLowerCase()}, pesado e fora de sua posição costumeira, chamou a atenção da perícia.`,
    situationalClue: `Pequenas marcas e vestígios de manuseio recente denunciavam que o item esteve no centro do embate.`,
    mysteryDetail: `Ninguém na mansão soube explicar por que ${victimName} mantinha aquele pertence tão próximo de si.`,
  };
}

function generateFallbackMethodClue(method: CardMethod): MethodClue {
  const cat = method.category || 'Físico';
  if (cat === 'Químico') {
    return {
      sensoryClue: 'Um odor penetrante e sutil de substâncias corrosivas pairava no ar fechado do cômodo.',
    };
  }
  if (cat === 'Mecânico') {
    return {
      sensoryClue: 'Um estalo seco e metálico ecoou na penumbra pouco antes do silêncio repentino.',
    };
  }
  if (cat === 'Ambiental') {
    return {
      sensoryClue: 'O ar gélido e denso do cômodo parecia ter drenado toda a vitalidade do recinto.',
    };
  }
  if (cat === 'Psicológico') {
    return {
      sensoryClue: 'A expressão da vítima revelava um choque súbito e paralisante antes do colapso final.',
    };
  }
  return {
    sensoryClue: 'Uma testemunha ouviu um barulho seco e abafado vindo da sala pouco antes da morte.',
  };
}

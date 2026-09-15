import type { WorkoutTemplate } from './types'

const ex = (id: string, name: string, muscle: string, sets: number, repMin: number, repMax: number, rest: number, spineStress: 'LOW'|'MODERATE'|'HIGH', trekking=false, notes?: string) => ({id,name,muscle,sets,repMin,repMax,rest,spineStress,trekking,notes})

export const workouts: WorkoutTemplate[] = [
  {
    id: 'A', title: 'Treino A', focus: 'Quadríceps + glúteos + subida', cardio: '15 min de esteira inclinada, começando em 5–8%.',
    exercises: [
      ex('legpress45','Leg press 45°','Quadríceps/Glúteos',4,8,12,105,'MODERATE',true,'Não permitir retroversão pélvica no final da amplitude.'),
      ex('gobletbox','Agachamento Goblet para banco','Quadríceps/Glúteos',3,10,12,90,'MODERATE',true,'Somente se assintomática e com coluna neutra.'),
      ex('bulgarian','Afundo búlgaro com apoio','Quadríceps/Glúteos',3,8,12,90,'LOW',true),
      ex('extensora','Cadeira extensora','Quadríceps',3,12,15,70,'LOW'),
      ex('stepup','Step-up','Pernas',3,10,10,75,'LOW',true,'Controle total; não impulsionar com a perna de trás.'),
      ex('panturrilha-sentada','Panturrilha sentada','Panturrilha',4,12,20,60,'LOW',true),
      ex('pallof','Pallof Press','Core',3,10,15,50,'LOW',true,'Evitar rotação do tronco.')
    ]
  },
  {
    id: 'B', title: 'Treino B', focus: 'Costas + peito + ombros + core', cardio: '15–20 min em Zona 2.',
    exercises: [
      ex('puxada','Puxada frente','Costas',4,8,12,90,'LOW',true),
      ex('remada-apoiada','Remada máquina com apoio peitoral','Costas',4,8,12,90,'LOW',true),
      ex('supino-maquina','Supino máquina','Peito',3,8,12,90,'LOW'),
      ex('remada-baixa','Remada baixa','Costas',3,10,12,75,'LOW',true),
      ex('desenvolvimento','Desenvolvimento máquina com encosto','Ombros',3,10,12,75,'LOW'),
      ex('elevacao-lateral','Elevação lateral','Ombros',3,12,15,60,'LOW'),
      ex('facepull','Face Pull','Ombros/Costas',3,12,15,60,'LOW',true),
      ex('deadbug','Dead Bug','Core',3,8,12,50,'LOW',true),
      ex('birddog','Bird Dog','Core',3,8,12,50,'LOW',true)
    ]
  },
  {
    id: 'C', title: 'Treino C', focus: 'Trekking + estabilidade + resistência', cardio: '25–35 min de esteira inclinada ou escada.',
    exercises: [
      ex('stepup-c','Step-up','Pernas',4,10,15,75,'LOW',true),
      ex('stepdown','Step-down controlado','Pernas',3,8,12,75,'LOW',true,'Priorizar controle excêntrico para descidas.'),
      ex('passada-estacionaria','Passada estacionária','Pernas',3,10,12,75,'LOW',true),
      ex('abducao','Abdução de quadril','Glúteos',3,15,20,60,'LOW',true),
      ex('panturrilha-pe','Panturrilha em pé','Panturrilha',4,15,20,60,'LOW',true),
      ex('tibial','Tibial anterior','Tibial',3,15,20,50,'LOW',true),
      ex('pallof-c','Pallof Press','Core',3,12,12,50,'LOW',true)
    ]
  },
  {
    id: 'D', title: 'Treino D', focus: 'Posteriores + glúteos', cardio: 'Opcional: 10–15 min leve, se recuperação estiver boa.',
    exercises: [
      ex('mesa-flexora','Mesa flexora','Posteriores',4,10,15,75,'LOW'),
      ex('hipthrust','Hip Thrust máquina','Glúteos',4,8,12,90,'MODERATE',true,'Sem hiperextensão lombar no topo.'),
      ex('legpress-alto','Leg press com pés elevados','Posteriores/Glúteos',3,10,12,90,'MODERATE',true),
      ex('afundo-reverso','Afundo reverso com apoio','Pernas',3,10,10,75,'LOW',true),
      ex('flexora-sentada','Flexora sentada','Posteriores',3,12,15,60,'LOW'),
      ex('abducao-d','Abdução máquina','Glúteos',3,15,20,60,'LOW',true),
      ex('panturrilha-d','Panturrilha','Panturrilha',4,12,20,60,'LOW',true),
      ex('prancha-lateral','Prancha lateral','Core',3,20,40,50,'LOW',true,'Repetições representam segundos.')
    ]
  },
  {
    id: 'E', title: 'Treino E', focus: 'Superior + condicionamento', cardio: '20–30 min de esteira inclinada, escada ou elíptico.',
    exercises: [
      ex('puxada-neutra','Puxada neutra','Costas',3,10,12,75,'LOW',true),
      ex('remada-e','Remada apoiada','Costas',3,10,12,75,'LOW',true),
      ex('supino-inclinado','Supino inclinado máquina','Peito',3,10,12,75,'LOW'),
      ex('elevacao-e','Elevação lateral','Ombros',3,12,15,60,'LOW'),
      ex('reversefly','Reverse fly','Ombros/Costas',3,12,15,60,'LOW',true),
      ex('rosca','Rosca bíceps','Bíceps',2,10,15,60,'LOW'),
      ex('triceps','Tríceps polia','Tríceps',2,10,15,60,'LOW'),
      ex('birddog-e','Bird Dog','Core',3,10,10,50,'LOW',true)
    ]
  }
]

export const nutritionTarget = { calories: 1900, protein: 145, carbs: 195, fat: 60 }

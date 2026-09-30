/*
 * Dados base do Portal da Regulação.
 *
 * ATENÇÃO: os valores abaixo são DADOS DE EXEMPLO. Substitua pela
 * "Lista de especialidades" oficial (Ofício 432) antes da publicação.
 *
 * Estrutura:
 *   LOCALIDADES  -> bairros/distritos de origem dos pacientes
 *   ESPECIALIDADES[].fila[localidade] = [urgente, prioritario, eletivo]
 *   ESPECIALIDADES[].especialistas    = profissionais, local e horário
 */
window.PORTAL_DATA = {
  versao: "2026-09-30",
  exemplo: true,

  LOCALIDADES: [
    "Centro",
    "Nova Goiana",
    "Ponta de Pedras",
    "Tejucupapo",
    "Atapuz",
    "Carne de Vaca",
    "Barra de Catuama",
    "São Lourenço",
    "Zona Rural",
  ],

  PRIORIDADES: [
    { id: "urgente", nome: "Urgente" },
    { id: "prioritario", nome: "Prioritário" },
    { id: "eletivo", nome: "Eletivo" },
  ],

  ESPECIALIDADES: [
    {
      id: "cardiologia",
      nome: "Cardiologia",
      icone: "❤",
      especialistas: [
        { nome: "Dr(a). Especialista 01", local: "Policlínica Municipal", dias: "Seg e Qua", horario: "07:00 – 11:00" },
        { nome: "Dr(a). Especialista 02", local: "Policlínica Municipal", dias: "Sex", horario: "13:00 – 17:00" },
      ],
      fila: {
        "Centro": [4, 18, 42], "Nova Goiana": [2, 9, 25], "Ponta de Pedras": [1, 6, 14],
        "Tejucupapo": [1, 5, 11], "Atapuz": [0, 3, 8], "Carne de Vaca": [0, 2, 6],
        "Barra de Catuama": [1, 2, 5], "São Lourenço": [0, 4, 9], "Zona Rural": [2, 7, 16],
      },
    },
    {
      id: "ortopedia",
      nome: "Ortopedia",
      icone: "🦴",
      especialistas: [
        { nome: "Dr(a). Especialista 03", local: "Policlínica Municipal", dias: "Ter e Qui", horario: "07:00 – 12:00" },
        { nome: "Dr(a). Especialista 04", local: "Unidade de Saúde Centro", dias: "Seg", horario: "13:00 – 17:00" },
      ],
      fila: {
        "Centro": [3, 22, 61], "Nova Goiana": [1, 12, 33], "Ponta de Pedras": [1, 7, 19],
        "Tejucupapo": [0, 6, 15], "Atapuz": [0, 4, 10], "Carne de Vaca": [0, 3, 7],
        "Barra de Catuama": [0, 2, 6], "São Lourenço": [1, 5, 13], "Zona Rural": [1, 9, 24],
      },
    },
    {
      id: "oftalmologia",
      nome: "Oftalmologia",
      icone: "👁",
      especialistas: [
        { nome: "Dr(a). Especialista 05", local: "Centro de Especialidades", dias: "Seg a Qua", horario: "08:00 – 12:00" },
      ],
      fila: {
        "Centro": [2, 25, 88], "Nova Goiana": [1, 14, 47], "Ponta de Pedras": [0, 8, 26],
        "Tejucupapo": [0, 7, 21], "Atapuz": [0, 4, 13], "Carne de Vaca": [0, 3, 9],
        "Barra de Catuama": [0, 2, 8], "São Lourenço": [1, 6, 18], "Zona Rural": [1, 11, 35],
      },
    },
    {
      id: "neurologia",
      nome: "Neurologia",
      icone: "🧠",
      especialistas: [
        { nome: "Dr(a). Especialista 06", local: "Centro de Especialidades", dias: "Qui", horario: "07:00 – 13:00" },
      ],
      fila: {
        "Centro": [3, 11, 29], "Nova Goiana": [1, 6, 15], "Ponta de Pedras": [1, 3, 8],
        "Tejucupapo": [0, 3, 7], "Atapuz": [0, 2, 5], "Carne de Vaca": [0, 1, 3],
        "Barra de Catuama": [0, 1, 3], "São Lourenço": [0, 2, 6], "Zona Rural": [1, 4, 11],
      },
    },
    {
      id: "dermatologia",
      nome: "Dermatologia",
      icone: "✋",
      especialistas: [
        { nome: "Dr(a). Especialista 07", local: "Policlínica Municipal", dias: "Ter", horario: "13:00 – 17:00" },
      ],
      fila: {
        "Centro": [0, 8, 34], "Nova Goiana": [0, 5, 18], "Ponta de Pedras": [0, 3, 12],
        "Tejucupapo": [0, 2, 9], "Atapuz": [0, 2, 6], "Carne de Vaca": [0, 1, 5],
        "Barra de Catuama": [0, 1, 4], "São Lourenço": [0, 2, 7], "Zona Rural": [0, 4, 13],
      },
    },
    {
      id: "ginecologia",
      nome: "Ginecologia e Obstetrícia",
      icone: "♀",
      especialistas: [
        { nome: "Dr(a). Especialista 08", local: "Unidade de Saúde Centro", dias: "Seg a Sex", horario: "07:00 – 11:00" },
        { nome: "Dr(a). Especialista 09", local: "Policlínica Municipal", dias: "Qua", horario: "13:00 – 17:00" },
      ],
      fila: {
        "Centro": [2, 14, 30], "Nova Goiana": [1, 8, 17], "Ponta de Pedras": [1, 5, 10],
        "Tejucupapo": [1, 4, 9], "Atapuz": [0, 3, 6], "Carne de Vaca": [0, 2, 5],
        "Barra de Catuama": [0, 2, 4], "São Lourenço": [0, 3, 8], "Zona Rural": [1, 6, 14],
      },
    },
    {
      id: "urologia",
      nome: "Urologia",
      icone: "⚕",
      especialistas: [
        { nome: "Dr(a). Especialista 10", local: "Centro de Especialidades", dias: "Sex", horario: "07:00 – 12:00" },
      ],
      fila: {
        "Centro": [1, 9, 27], "Nova Goiana": [0, 5, 14], "Ponta de Pedras": [0, 3, 8],
        "Tejucupapo": [0, 2, 7], "Atapuz": [0, 1, 5], "Carne de Vaca": [0, 1, 3],
        "Barra de Catuama": [0, 1, 3], "São Lourenço": [0, 2, 6], "Zona Rural": [1, 4, 10],
      },
    },
    {
      id: "endocrinologia",
      nome: "Endocrinologia",
      icone: "⚖",
      especialistas: [
        { nome: "Dr(a). Especialista 11", local: "Policlínica Municipal", dias: "Qua", horario: "07:00 – 12:00" },
      ],
      fila: {
        "Centro": [1, 10, 36], "Nova Goiana": [0, 6, 19], "Ponta de Pedras": [0, 3, 10],
        "Tejucupapo": [0, 3, 9], "Atapuz": [0, 2, 6], "Carne de Vaca": [0, 1, 4],
        "Barra de Catuama": [0, 1, 4], "São Lourenço": [0, 2, 8], "Zona Rural": [0, 5, 15],
      },
    },
    {
      id: "otorrino",
      nome: "Otorrinolaringologia",
      icone: "👂",
      especialistas: [
        { nome: "Dr(a). Especialista 12", local: "Centro de Especialidades", dias: "Ter", horario: "07:00 – 11:00" },
      ],
      fila: {
        "Centro": [0, 7, 24], "Nova Goiana": [0, 4, 13], "Ponta de Pedras": [0, 2, 7],
        "Tejucupapo": [0, 2, 6], "Atapuz": [0, 1, 4], "Carne de Vaca": [0, 1, 3],
        "Barra de Catuama": [0, 1, 2], "São Lourenço": [0, 1, 5], "Zona Rural": [0, 3, 9],
      },
    },
    {
      id: "psiquiatria",
      nome: "Psiquiatria",
      icone: "☯",
      especialistas: [
        { nome: "Dr(a). Especialista 13", local: "CAPS Goiana", dias: "Seg e Qui", horario: "08:00 – 12:00" },
      ],
      fila: {
        "Centro": [2, 12, 20], "Nova Goiana": [1, 7, 11], "Ponta de Pedras": [0, 4, 6],
        "Tejucupapo": [0, 3, 5], "Atapuz": [0, 2, 4], "Carne de Vaca": [0, 1, 3],
        "Barra de Catuama": [0, 1, 2], "São Lourenço": [0, 2, 5], "Zona Rural": [1, 4, 8],
      },
    },
    {
      id: "pediatria",
      nome: "Pediatria",
      icone: "☺",
      especialistas: [
        { nome: "Dr(a). Especialista 14", local: "Unidade de Saúde Centro", dias: "Seg a Sex", horario: "13:00 – 17:00" },
      ],
      fila: {
        "Centro": [1, 6, 15], "Nova Goiana": [1, 4, 9], "Ponta de Pedras": [0, 2, 5],
        "Tejucupapo": [0, 2, 5], "Atapuz": [0, 1, 3], "Carne de Vaca": [0, 1, 2],
        "Barra de Catuama": [0, 1, 2], "São Lourenço": [0, 1, 4], "Zona Rural": [0, 3, 7],
      },
    },
    {
      id: "gastro",
      nome: "Gastroenterologia",
      icone: "✚",
      especialistas: [
        { nome: "Dr(a). Especialista 15", local: "Centro de Especialidades", dias: "Qua", horario: "13:00 – 17:00" },
      ],
      fila: {
        "Centro": [1, 8, 22], "Nova Goiana": [0, 4, 12], "Ponta de Pedras": [0, 2, 7],
        "Tejucupapo": [0, 2, 6], "Atapuz": [0, 1, 4], "Carne de Vaca": [0, 1, 2],
        "Barra de Catuama": [0, 1, 2], "São Lourenço": [0, 2, 5], "Zona Rural": [0, 3, 9],
      },
    },
  ],
};

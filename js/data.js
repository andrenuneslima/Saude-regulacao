/*
 * Dados base do Portal da Regulação — Prefeitura de Goiana.
 *
 * Fonte: "Rede própria de Especialidades médicas ofertados pelo município de
 * Goiana e que podem ser agendados / inseridos no SISREG" (Lista de
 * especialidades).
 *
 * Campos de cada serviço:
 *   categoria   "consulta" | "exame"
 *   locais      códigos de UNIDADES
 *   idade       faixa etária atendida
 *   medicos     [{ nome, dias, obs }]
 *   oferta      quantidade média ofertada por mês (null = não informada, "---")
 *   fila        pacientes na fila de espera
 *   tempoMedio  tempo médio para agendamento, em dias (null = não informado)
 */
window.PORTAL_DATA = {
  versao: "2026-09-30",
  fonte: "Lista de especialidades — rede própria do município de Goiana (SISREG)",

  UNIDADES: {
    PNSV: "Policlínica Nossa Senhora da Vitória (PNSV)",
    CSM: "Centro de Saúde da Mulher (CSM)",
    TEJUCUPAPO: "Tejucupapo",
    PONTA: "Ponta de Pedras",
    CRESCER: "Casa Crescer",
    UPINHA: "Upinha",
  },

  SERVICOS: [
    // ---------- Consultas especializadas ----------
    {
      id: "angiologia", nome: "Angiologia / Vascular", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "18 a 120 anos",
      medicos: [{ nome: "Miriam", dias: "Quarta" }, { nome: "Paloma", dias: "Sexta" }],
      oferta: 280, fila: 0, tempoMedio: 0,
    },
    {
      id: "clinica-medica", nome: "Clínica Médica", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "18 a 120 anos",
      medicos: [
        { nome: "Jessica", dias: "Segunda" }, { nome: "Geyhsy", dias: "Terça" },
        { nome: "Paula", dias: "Quinta" }, { nome: "Ryan", dias: "Sexta" },
      ],
      oferta: 480, fila: 0, tempoMedio: 0,
    },
    {
      id: "cardiologia", nome: "Cardiologia", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO", "PONTA"], idade: "18 a 120 anos",
      medicos: [
        { nome: "Nathalia", dias: "Terça" }, { nome: "Jose Neto", dias: "Quarta" },
        { nome: "Marcus", dias: "Quinta" }, { nome: "Lorena", dias: "Sexta" },
      ],
      oferta: 420, fila: 89, tempoMedio: 10,
    },
    {
      id: "cardiologia-pediatrica", nome: "Cardiologia Pediátrica", categoria: "consulta",
      locais: ["CRESCER"], idade: "0 a 17 anos",
      medicos: [{ nome: "Thayane", dias: "Quinta" }],
      oferta: 120, fila: 0, tempoMedio: 0,
    },
    {
      id: "cirurgia-geral", nome: "Cirurgia Geral (pequenas cirurgias)", categoria: "consulta",
      locais: ["UPINHA", "PONTA"], idade: "18 a 120 anos",
      medicos: [{ nome: "Diana", dias: "—", obs: "Upinha" }, { nome: "Israel", dias: "—", obs: "Upinha / Ponta de Pedras" }],
      oferta: 100, fila: 142, tempoMedio: 45,
    },
    {
      id: "dermatologia", nome: "Dermatologia", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO", "CSM"], idade: "0 a 120 anos",
      medicos: [
        { nome: "Renata", dias: "Terça", obs: "Única que atende pacientes de hanseníase" },
        { nome: "Maira", dias: "Sexta" }, { nome: "Katarine", dias: "Terça" },
      ],
      oferta: 240, fila: 54, tempoMedio: 10,
    },
    {
      id: "endocrinologia", nome: "Endocrinologia", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO", "CSM"], idade: "18 a 120 anos",
      medicos: [
        { nome: "Amanda", dias: "Terça e Quarta" }, { nome: "Frederico", dias: "Sexta" },
        { nome: "Ana Eduarda", dias: "Quarta" },
      ],
      oferta: 360, fila: 116, tempoMedio: 15,
    },
    {
      id: "endocrinologia-pediatrica", nome: "Endocrinologia Pediátrica", categoria: "consulta",
      locais: ["PNSV"], idade: "0 a 18 anos",
      medicos: [{ nome: "Livia", dias: "Quarta" }],
      oferta: 80, fila: 0, tempoMedio: 0,
    },
    {
      id: "gastroenterologia", nome: "Gastroenterologia / Hepatologia", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "17 a 120 anos",
      medicos: [
        { nome: "Bruno", dias: "Quinta", obs: "Também atende hepatologia" },
        { nome: "Clarissa", dias: "Sexta" },
      ],
      oferta: 240, fila: 28, tempoMedio: 0,
    },
    {
      id: "geriatria", nome: "Geriatria", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "60 a 120 anos",
      medicos: [{ nome: "Beatriz", dias: "Segunda" }],
      oferta: 120, fila: 0, tempoMedio: 0,
    },
    {
      id: "ginecologia", nome: "Ginecologia", categoria: "consulta",
      locais: ["CSM"], idade: "13 a 120 anos",
      medicos: [
        { nome: "Maisa", dias: "Segunda" }, { nome: "Ana Luisa", dias: "Terça e Quinta" },
        { nome: "Edinilza", dias: "Quarta" }, { nome: "Leticia", dias: "Quarta" },
      ],
      oferta: 480, fila: 97, tempoMedio: 15,
    },
    {
      id: "insercao-diu", nome: "Inserção de DIU", categoria: "consulta",
      locais: ["CSM"], idade: "13 a 120 anos",
      medicos: [{ nome: "Ana Luisa", dias: "Quinta" }],
      oferta: 8, fila: 15, tempoMedio: 60,
    },
    {
      id: "mastologia", nome: "Mastologia", categoria: "consulta",
      locais: ["CSM"], idade: "13 a 120 anos",
      medicos: [{ nome: "Wiviane", dias: "Terça" }],
      oferta: 80, fila: 0, tempoMedio: 0,
    },
    {
      id: "neonatologia", nome: "Neonatologia", categoria: "consulta",
      locais: ["CRESCER"], idade: "0 ano",
      medicos: [{ nome: "Marina", dias: "Quinta" }],
      oferta: 80, fila: 0, tempoMedio: 0,
    },
    {
      id: "neurocirurgia", nome: "Neurocirurgia", categoria: "consulta",
      locais: ["PNSV"], idade: "18 a 120 anos",
      medicos: [{ nome: "Thailane", dias: "Terça", obs: "Licença-maternidade" }],
      oferta: null, fila: 16, tempoMedio: null,
    },
    {
      id: "neurologia", nome: "Neurologia", categoria: "consulta",
      locais: ["PNSV"], idade: "18 a 120 anos",
      medicos: [{ nome: "Lindair", dias: "Segunda" }],
      oferta: 90, fila: 1024, tempoMedio: 300,
    },
    {
      id: "neurologia-pediatrica", nome: "Neurologia Pediátrica", categoria: "consulta",
      locais: ["PNSV", "CRESCER"], idade: "0 a 17 anos",
      medicos: [
        { nome: "Waleska", dias: "Terça" }, { nome: "Lievin", dias: "Quinta" },
        { nome: "Lindair", dias: "Sexta" }, { nome: "Windsa", dias: "Sexta" },
      ],
      oferta: 240, fila: 853, tempoMedio: 120,
    },
    {
      id: "nutricao", nome: "Nutrição", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO", "CSM", "CRESCER"], idade: "0 a 120 anos",
      medicos: [
        { nome: "Simony", dias: "Quarta" }, { nome: "Elayne", dias: "Sexta" },
        { nome: "Marcilia", dias: "Segunda, Quarta e Sexta" },
      ],
      oferta: 600, fila: 0, tempoMedio: 0,
    },
    {
      id: "ortopedia", nome: "Ortopedia", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "10 a 120 anos",
      medicos: [
        { nome: "Ramon", dias: "Segunda" }, { nome: "Kauan", dias: "Terça e Quinta" },
        { nome: "Clodoveu", dias: "Quarta" },
      ],
      oferta: 480, fila: 557, tempoMedio: 40,
    },
    {
      id: "otorrinolaringologia", nome: "Otorrinolaringologia", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "0 a 120 anos",
      medicos: [{ nome: "Leopoldo", dias: "Quinta" }, { nome: "Marcelo", dias: "Sexta" }],
      oferta: 200, fila: 0, tempoMedio: 0,
    },
    {
      id: "oftalmologia", nome: "Oftalmologia", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "0 a 120 anos",
      medicos: [
        { nome: "Claudomiro", dias: "Segunda" }, { nome: "Natalia", dias: "Quarta" },
        { nome: "Thaina", dias: "Quinta" }, { nome: "Camila", dias: "Sexta" },
      ],
      oferta: 480, fila: 1409, tempoMedio: 90,
    },
    {
      id: "pediatria", nome: "Pediatria", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO", "CRESCER"], idade: "0 a 12 anos",
      medicos: [
        { nome: "Rosane", dias: "Segunda" }, { nome: "Sonia", dias: "Quinta" },
        { nome: "Sara", dias: "Quinta" }, { nome: "Thalita", dias: "Segunda e Sexta" },
      ],
      oferta: 500, fila: 0, tempoMedio: 0,
    },
    {
      id: "pneumologia", nome: "Pneumologia", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "18 a 120 anos",
      medicos: [{ nome: "Camila", dias: "Sexta" }],
      oferta: 60, fila: 10, tempoMedio: 5,
    },
    {
      id: "pneumologia-pediatrica", nome: "Pneumologia Pediátrica", categoria: "consulta",
      locais: ["CRESCER"], idade: "0 a 16 anos",
      medicos: [{ nome: "Amanda", dias: "Sexta", obs: "Afastada" }],
      oferta: null, fila: 0, tempoMedio: null,
    },
    {
      id: "proctologia", nome: "Proctologia", categoria: "consulta",
      locais: ["PNSV"], idade: "18 a 120 anos",
      medicos: [{ nome: "Patricia", dias: "Quarta" }],
      oferta: 80, fila: 39, tempoMedio: 15,
    },
    {
      id: "pre-natal-alto-risco", nome: "Pré-natal de Alto Risco", categoria: "consulta",
      locais: ["CSM"], idade: "12 a 120 anos",
      medicos: [{ nome: "Ana Maria", dias: "Sexta" }, { nome: "Mayara", dias: "Segunda" }],
      oferta: 60, fila: 5, tempoMedio: 5,
    },
    {
      id: "psiquiatria", nome: "Psiquiatria", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "18 a 120 anos",
      medicos: [
        { nome: "Aline", dias: "Segunda" }, { nome: "Gabrielle", dias: "Segunda e Terça" },
        { nome: "Polyanna", dias: "Quinta" },
      ],
      oferta: 480, fila: 1058, tempoMedio: 75,
    },
    {
      id: "psiquiatria-pediatrica", nome: "Psiquiatria Pediátrica", categoria: "consulta",
      locais: ["PNSV", "CRESCER"], idade: "0 a 17 anos",
      medicos: [
        { nome: "Gabriela", dias: "Segunda" }, { nome: "Rodrigo", dias: "Terça e Quarta" },
        { nome: "Jose Augusto", dias: "Segunda" },
      ],
      oferta: 240, fila: 0, tempoMedio: 0,
    },
    {
      id: "reumatologia", nome: "Reumatologia", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "18 a 120 anos",
      medicos: [{ nome: "Ana Valeska", dias: "Sexta" }, { nome: "Clara", dias: "Sexta" }],
      oferta: 200, fila: 99, tempoMedio: 15,
    },
    {
      id: "urologia", nome: "Urologia", categoria: "consulta",
      locais: ["PNSV", "TEJUCUPAPO"], idade: "8 a 120 anos",
      medicos: [{ nome: "Marfran", dias: "Quinta" }],
      oferta: 100, fila: 309, tempoMedio: 90,
    },
    {
      id: "uroginecologia", nome: "Uroginecologia", categoria: "consulta",
      locais: ["CSM"], idade: "13 a 120 anos",
      medicos: [{ nome: "Ana Luisa", dias: "Quinta" }],
      oferta: 30, fila: 0, tempoMedio: 0,
    },

    // ---------- Exames ----------
    {
      id: "colonoscopia", nome: "Colonoscopia", categoria: "exame",
      locais: ["UPINHA"], idade: "18 a 120 anos",
      medicos: [{ nome: "Marcelo", dias: "2x no mês" }, { nome: "Daniel", dias: "Quarta, de 15 em 15 dias" }],
      oferta: 80, fila: 198, tempoMedio: 90,
    },
    {
      id: "ecocardiograma", nome: "Ecocardiograma", categoria: "exame",
      locais: ["UPINHA"], idade: "2 a 120 anos",
      medicos: [{ nome: "Jonathas", dias: "Terça" }],
      oferta: 80, fila: 838, tempoMedio: 300,
    },
    {
      id: "endoscopia", nome: "Endoscopia", categoria: "exame",
      locais: ["UPINHA", "PONTA"], idade: "16 a 120 anos",
      medicos: [
        { nome: "Ricardo", dias: "Terça, de 15 em 15 dias" }, { nome: "Henrique", dias: "Quinta" },
        { nome: "Silvio", dias: "Quarta" },
      ],
      oferta: 240, fila: 27, tempoMedio: 10,
    },
    {
      id: "exames-oftalmologicos", nome: "Exames Oftalmológicos", categoria: "exame",
      locais: ["PNSV"], idade: "0 a 120 anos",
      medicos: [{ nome: "Claudomiro", dias: "Quinta" }],
      oferta: 200, fila: 755, tempoMedio: 120,
      obs: "Exames ofertados: biometria, campimetria, curva, gonioscopia, mapeamento de retina, paquimetria, retinografia, topografia e ultrassonografia do globo ocular.",
    },
    {
      id: "usg", nome: "Ultrassonografia (USG)", categoria: "exame",
      locais: ["UPINHA", "CSM", "PNSV", "TEJUCUPAPO", "CRESCER", "PONTA"], idade: "0 a 120 anos",
      medicos: [
        { nome: "Carol", dias: "Quarta" }, { nome: "Pierre", dias: "Terça" },
        { nome: "Mauro", dias: "Quarta" }, { nome: "Sandrinerio", dias: "Quinta" },
        { nome: "Henderson", dias: "Terça" }, { nome: "Matheus", dias: "—", obs: "PSF" },
        { nome: "Gildomar", dias: "Sexta", obs: "Melões" }, { nome: "Anyelle", dias: "Segunda e Sexta" },
        { nome: "Livia", dias: "Terça" },
      ],
      oferta: 1440, fila: 7473, tempoMedio: 150,
      obs: "Com Doppler: carótidas, venoso e arterial de MMII e MMSS, abdome total, bolsa escrotal, obstétrica, tireoide, mama e transvaginal. Sem Doppler: abdome total, abdome superior, aparelho urinário, articulação, bolsa escrotal, mama/axila, obstétrica, obstétrica morfológica, parede abdominal, partes moles, próstata, tireoide, pélvica e transvaginal.",
    },
  ],
};

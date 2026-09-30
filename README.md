# Portal da Regulação - Prefeitura de Goiana

Sistema web de consulta da fila de espera da regulação da Secretaria Municipal de Saúde de Goiana-PE, organizado por especialidade (base: Ofício 432 / Lista de especialidades).

## Funcionalidades

- **Painel geral**: pacientes aguardando consulta e exame, oferta mensal, serviços com espera longa, gráficos da fila por serviço, busca por especialidade/exame/médico e filtro por unidade.
- **Dashboard por especialidade ou exame**: fila de espera, tempo médio para agendamento, oferta média mensal, relação fila ÷ oferta, agenda semanal dos médicos, unidades de atendimento, faixa etária e observações.
- **Atualizar cadastro** (menu):
  - *Fila de espera*: aumentar, diminuir ou definir a fila e o tempo médio de cada serviço. Os dashboards mudam na hora.
  - *Médicos, unidades e oferta*: incluir, editar e remover médicos e dias de atendimento; alterar unidades, faixa etária, oferta mensal e observações; criar novos serviços.
  - *Dados e backup*: exportar/importar os dados (JSON), exportar planilha (CSV) e restaurar a lista oficial.
- **Histórico de atualizações**: registra data, fila antes/depois, tempo médio, motivo e responsável.

Situação da fila (pelo tempo médio para agendamento): até 15 dias = espera curta; 16 a 60 = moderada; acima de 60 = longa; sem oferta = atendimento suspenso.

## Estrutura

```
index.html        página única (rotas via #/...)
css/style.css     layout e paleta de cores (variáveis no topo do arquivo)
js/data.js        DADOS BASE: unidades e serviços da Lista de especialidades
js/app.js         lógica dos dashboards e do menu Atualizar cadastro
```

## Dados

`js/data.js` foi preenchido a partir da *Lista de especialidades* (rede própria do município de Goiana que pode ser agendada pelo SISREG): 31 especialidades e 5 exames, com unidades, faixa etária, médicos e dias de atendimento, oferta média mensal, fila de espera e tempo médio para agendamento. Valores "---" do documento aparecem como "não informado".

## Onde ficam as atualizações

Esta versão é 100% estática (não tem servidor nem banco de dados). As alterações feitas em **Atualizar cadastro** ficam salvas no navegador de quem atualizou. Para que todos vejam os novos números, exporte o JSON em *Dados e backup* e atualize `js/data.js` (ou importe o arquivo nos outros computadores).
Para atualização compartilhada em tempo real, com login dos servidores, o próximo passo é adicionar um backend (ex.: API + banco de dados).

## Executar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicação

O workflow `.github/workflows/pages.yml` publica o site no GitHub Pages a cada push na branch `main`.
Ative em *Settings → Pages → Build and deployment → Source: GitHub Actions*.
Também pode ser hospedado em qualquer servidor web da prefeitura: basta copiar os arquivos.

## Paleta de cores

As cores institucionais ficam no início de `css/style.css` (`--brand`, `--accent`). Ajuste-as conforme o manual de identidade visual da Prefeitura de Goiana.

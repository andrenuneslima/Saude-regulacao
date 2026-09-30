# Portal da Regulação - Prefeitura de Goiana

Sistema web de consulta da fila de espera da regulação da Secretaria Municipal de Saúde de Goiana-PE, organizado por especialidade (base: Ofício 432 / Lista de especialidades).

## Funcionalidades

- **Painel geral**: total de pacientes na fila, divisão por prioridade (urgente, prioritário, eletivo), fila por especialidade e por localidade.
- **Dashboard por especialidade**: fila de pacientes, localidades de origem, especialistas, local, dias e horário de atendimento, além das últimas atualizações.
- **Atualizar cadastro** (menu):
  - *Fila de espera*: aumentar, diminuir ou definir o número exato de pacientes por especialidade, localidade e prioridade. Os dashboards mudam na hora.
  - *Especialistas e horários*: incluir, editar e remover profissionais; criar novas especialidades.
  - *Dados e backup*: exportar/importar os dados (JSON), exportar a fila em CSV e restaurar a base.
- **Histórico de atualizações**: registra data, variação, motivo e responsável de cada alteração.

## Estrutura

```
index.html        página única (rotas via #/...)
css/style.css     layout e paleta de cores (variáveis no topo do arquivo)
js/data.js        DADOS BASE: especialidades, localidades, especialistas e fila
js/app.js         lógica dos dashboards e do menu Atualizar cadastro
```

## Carregar a lista oficial de especialidades

O arquivo `js/data.js` está com **dados de exemplo**. Para usar os dados oficiais:

1. Edite `LOCALIDADES` e `ESPECIALIDADES` em `js/data.js` com a Lista de especialidades.
   Em cada especialidade, `fila["Localidade"] = [urgente, prioritário, eletivo]`.
2. Troque `exemplo: true` para `exemplo: false` (remove o aviso amarelo) e atualize `versao`.

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

MINHA LOJA - versão simplificada

- Não existe mais a página de Produtos.
- O nome do produto é digitado diretamente nas telas de Vendas, Gastos e Investimentos.
- Nenhum campo dos formulários é obrigatório.
- Os lançamentos são salvos automaticamente no navegador e no banco SQLite permanente (`loja.db`) pelo servidor.
- Se a API estiver indisponível, o sistema usa o armazenamento local do navegador como fallback.
- Para uso local, inicie o sistema com `python app.py` e abra `http://127.0.0.1:5000`.
- Para acessar os mesmos dados em todos os lugares, publique no Render usando o arquivo `render.yaml`. O serviço deve usar um Persistent Disk montado em `/var/data`, onde o banco será salvo.
- No Render, crie um novo serviço usando este repositório e confirme o Persistent Disk de 1 GB. Depois da publicação, use o endereço `https://...onrender.com` em todos os dispositivos.
- O sistema não possui login. Qualquer pessoa com o endereço público poderá ver e alterar os dados.
- Não abra o `index.html` diretamente com duplo clique: nesse modo o navegador não consegue acessar o banco SQLite do servidor.
- As páginas de Vendas, Gastos, Investimentos, Lucros e Tarefas permanecem disponíveis.

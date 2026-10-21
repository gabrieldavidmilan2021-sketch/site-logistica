MINHA LOJA - versão simplificada

- Não existe mais a página de Produtos.
- O nome do produto é digitado diretamente nas telas de Vendas, Gastos e Investimentos.
- Nenhum campo dos formulários é obrigatório.
- Os lançamentos são salvos automaticamente no navegador e no banco SQLite permanente (`loja.db`) pelo servidor.
- Se a API estiver indisponível, o sistema usa o armazenamento local do navegador como fallback.
- Configure `APP_USERNAME` e `APP_PASSWORD` antes de iniciar o servidor. Para uso local, execute `python app.py` e abra `http://127.0.0.1:5000`; o navegador pedirá usuário e senha.
- Para acessar os mesmos dados em todos os lugares, publique no Render usando o arquivo `render.yaml`. O serviço deve usar um Persistent Disk montado em `/var/data`, onde o banco será salvo.
- No Render, crie um Blueprint usando este repositório e o arquivo `render.yaml`. Informe `APP_USERNAME` e `APP_PASSWORD` como variáveis secretas e confirme o Persistent Disk de 1 GB. Depois da publicação, use o endereço `https://...onrender.com` em todos os dispositivos.
- O site exige autenticação HTTP Basic para todas as páginas e para a API. Use uma senha forte e exclusiva.
- Não abra o `index.html` diretamente com duplo clique: nesse modo o navegador não consegue acessar o banco SQLite do servidor.
- As páginas de Vendas, Gastos, Investimentos, Lucros e Tarefas permanecem disponíveis.

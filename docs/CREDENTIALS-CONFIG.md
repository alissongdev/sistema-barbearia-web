# Configuração de Credenciais

Este documento explica como gerenciar de forma segura as credenciais da API em ambientes de desenvolvimento e produção.

## Arquitetura de segurança

Este projeto utiliza um mecanismo de carregamento de configuração que:

1. Carrega as credenciais de um arquivo externo durante a inicialização da aplicação
2. Utiliza um interceptor HTTP preparado para tratar requisições mesmo quando a configuração ainda está sendo carregada
3. Mantém as credenciais fora do bundle do código-fonte

## Desenvolvimento local

Para o desenvolvimento local:

1. Crie um arquivo `config.dev.json` na pasta `src/assets/config/` baseado no arquivo de exemplo:

   ```json
   {
     "apiCredentials": {
       "username": "credencial-de-desenvolvimento",
       "password": "senha-de-desenvolvimento"
     }
   }
   ```

2. O arquivo `config.dev.json` está configurado no `.gitignore` para não ser versionado.

3. O `ConfigService` tentará carregar este arquivo automaticamente em ambiente de desenvolvimento.

## Deploy na Vercel

O projeto inclui uma configuração especial para deploy na Vercel:

1. Configure as seguintes variáveis de ambiente no painel da Vercel:

   - `VERCEL_API_USERNAME`: Nome de usuário da API em produção
   - `VERCEL_API_PASSWORD`: Senha da API em produção

2. A configuração no arquivo `vercel.json` já está preparada para:

   - Executar o script de build específico para a Vercel
   - Configurar o proxy para a API
   - Garantir que as rotas funcionem corretamente para a aplicação Angular

3. Durante o processo de build, o script `vercel-build.sh` automaticamente:
   - Cria o arquivo de configuração com as credenciais das variáveis de ambiente
   - Substitui os marcadores nos arquivos compilados

Nenhuma ação adicional é necessária além de configurar as variáveis de ambiente no painel da Vercel.

## Em outros ambientes

### Opção 1: Usando variáveis de ambiente (Recomendado)

Para o método mais seguro de deploy, utilize o script de build seguro que gera o arquivo de configuração a partir de variáveis de ambiente:

1. Configure as variáveis de ambiente no servidor:

   ```bash
   export API_USERNAME="credencial-de-producao"
   export API_PASSWORD="senha-de-producao"
   ```

2. Ou crie um arquivo `.env` na raiz do projeto baseado no `.env.example` com suas credenciais.

3. Execute o script de build seguro:
   ```bash
   npm run build:secure
   ```

Este método garante que as credenciais nunca sejam armazenadas em arquivos dentro do repositório.

### Opção 2: Configuração manual

Se preferir configurar manualmente, siga estas etapas:

1. No servidor onde a aplicação será hospedada, crie um arquivo `config.json` com a seguinte estrutura:

   ```json
   {
     "apiCredentials": {
       "username": "credencial-de-producao",
       "password": "senha-de-producao"
     }
   }
   ```

2. Coloque este arquivo no caminho: `/assets/config/config.json` relativo à pasta onde a aplicação está hospedada.

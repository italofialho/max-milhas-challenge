# MaxMilhas Challenge

#### Instalando dependências

1. Rodar o comando abaixo

```zsh
yarn
```

#### Configurando arquivos

1.  Rodar o comando abaixo para criar o arquivo `.env`.

```zsh
cp .env.example .env
```

2. Preencher o arquivo `.env` criado de acordo com o que é pedido no próprio arquivo. Exemplo:

```txt

```

3. Conferir o ambiente que o projeto vai ser executado no `.env` ENVIRONMENT=production ou ENVIRONMENT=development

#### Realizando build

1.  Rodar o comando abaixo para criar os arquivos necessários.

```zsh
yarn build
```

### Desenvolvimento

Para iniciar o app em modo desenvolvimento basta seguir a seguinte instrução:

1. Rodar o comando para iniciar app em modo `development`.

```zsh
yarn dev
```

### Produção

Para iniciar o app em modo de produção siga a seguinte instrução:

1. Instalar [`pm2`](https://github.com/Unitech/pm2)

```zsh
yarn global add pm2
```

2. Iniciar app pelo pm2

```zsh
pm2 start pm2.config.json
```

3. Gerar script de startup

```zsh
pm2 startup
```

4. Salvar estado do pm2

```zsh
pm2 save
```

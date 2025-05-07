REM aqui será baixado o arquivo de uso do fontawesome
curl https://use.fontawesome.com/releases/v6.7.2/fontawesome-free-6.7.2-web.zip -O fontawesome-free-6.7.2-web.zip 

REM aqui descompacta o arquivo baixado acima
tar -xf fontawesome-free-6.7.2-web.zip

REM aqui será excluído o arquivo baixado
del fontawesome-free-6.7.2-web.zip -y

REM aqui serão instalados todos os pacotes node
npm i

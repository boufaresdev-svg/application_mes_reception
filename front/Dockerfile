FROM node:20.19-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production

FROM tomcat:10.1-jre21-temurin

RUN rm -rf /usr/local/tomcat/webapps/*

COPY --from=build /app/dist/mes-reception/browser/ /usr/local/tomcat/webapps/ROOT/

EXPOSE 8080

CMD ["catalina.sh", "run"]

FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN ./mvnw dependency:go-offline -q
COPY src src
RUN ./mvnw package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache libreoffice ttf-dejavu

COPY --from=builder /app/target/*.jar app.jar
RUN mkdir -p /app/uploads
EXPOSE 8380
ENTRYPOINT ["java", "-jar", "app.jar"]
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache python3 make g++
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN apk add --no-cache python3 make g++
RUN npm install

COPY --from=build /app/dist ./dist
COPY --from=build /app/api/src ./api/src
COPY --from=build /app/shared ./shared
COPY --from=build /app/.env ./.env
COPY --from=build /app/tsconfig.json ./tsconfig.json

RUN mkdir -p /app/data /app/api/uploads

VOLUME ["/app/data", "/app/api/uploads"]

EXPOSE 3001

CMD ["node", "--import", "tsx", "api/src/index.ts"]

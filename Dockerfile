FROM node:20-alpine AS base

WORKDIR /usr/src/unleashed-backend-yms

COPY package*.json ./

FROM base AS dependencies
RUN npm install

FROM base AS build
COPY --from=dependencies /usr/src/unleashed-backend-yms/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS production
ENV NODE_ENV=production

RUN npm install

COPY --from=build /usr/src/unleashed-backend-yms/dist ./dist
COPY --from=build /usr/src/unleashed-backend-yms/package*.json ./
COPY --from=build /usr/src/unleashed-backend-yms/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

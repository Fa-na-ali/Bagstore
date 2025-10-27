
FROM node:20


WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY backend/ ./backend


EXPOSE 5004

CMD ["npm", "run", "backend"]

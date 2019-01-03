#FROM arm64v8/node:10-alpine
#COPY qemu-aarch64-static /usr/bin

FROM node:10-alpine

# Create app directory
WORKDIR /usr/src/app

VOLUME ["/usr/src/app/log", "/usr/src/app/output"]

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

#compile app
RUN npm run build

EXPOSE 8080
CMD [ "npm", "start" ]


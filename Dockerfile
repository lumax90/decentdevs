FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
ARG NEXT_PUBLIC_SITE_URL=https://decentdevs.com
ARG NEXT_PUBLIC_CONTACT_EMAIL=
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATA_DIR=/app/data
RUN groupadd --system --gid 1001 decent && useradd --system --uid 1001 --gid decent decent && mkdir -p /app/data && chown decent:decent /app/data
COPY --from=build --chown=decent:decent /app/.next/standalone ./
COPY --from=build --chown=decent:decent /app/.next/static ./.next/static
COPY --from=build --chown=decent:decent /app/public ./public
USER decent
EXPOSE 3000
CMD ["node", "server.js"]

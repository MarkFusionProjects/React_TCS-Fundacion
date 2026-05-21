APP_ROOT=/home/eventos
DIRECTORY=$(APP_ROOT)/Donaciones
FRONTEND=$(DIRECTORY)/React_TCS-Fundacion

.PHONY: frontend nginx-reload deploy

env:
	cp $(DIRECTORY)/.env.frontend $(FRONTEND)/.env && \
	@echo "Frontend .env creado correctamente"

frontend: env
	cd $(FRONTEND) && \
	npm install && \
	npm run build

nginx-reload:
	sudo cp $(APP_ROOT)/nginx.conf /etc/nginx/sites-available/default
	sudo nginx -t
	sudo systemctl reload nginx

deploy: frontend nginx-reload
	@echo "Despliegue Fundacion TCS completo"
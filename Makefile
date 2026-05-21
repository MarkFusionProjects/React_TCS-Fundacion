APP_ROOT=/home/eventos
FRONTEND=$(APP_ROOT)/Donaciones/React_TCS-Fundacion

.PHONY: frontend nginx-reload deploy

frontend:
	cd $(FRONTEND) && \
	npm install && \
	npm run build

nginx-reload:
	sudo cp $(APP_ROOT)/nginx.conf /etc/nginx/sites-available/default
	sudo nginx -t
	sudo systemctl reload nginx

deploy: frontend nginx-reload
	@echo "Despliegue TCS Teatro completo"
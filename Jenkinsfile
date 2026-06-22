pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        // ─── Aşama 1: Kaynak Kodu Çekme ─────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Kaynak kodu çekiliyor...'
                checkout scm
            }
        }

        // ─── Aşama 2: Build ─────────────────────────────────────────────────
        stage('Build') {
            parallel {
                stage('Build Backend Docker Image') {
                    steps {
                        echo '🐳 Backend Docker image oluşturuluyor...'
                        dir('backend') {
                            sh 'docker build -t savora-backend:latest .'
                        }
                    }
                }
                stage('Build Frontend Docker Image') {
                    steps {
                        echo '🐳 Frontend Docker image oluşturuluyor...'
                        dir('frontend') {
                            sh 'docker build -t savora-frontend:latest .'
                        }
                    }
                }
            }
        }

        // ─── Aşama 3: Deploy ────────────────────────────────────────────────
        stage('Deploy') {
            steps {
                echo '🚀 Uygulama deploy ediliyor...'
                sh 'docker compose -p savora -f ${DOCKER_COMPOSE_FILE} down || true'
                sh 'docker compose -p savora -f ${DOCKER_COMPOSE_FILE} up -d --build'
                echo '✅ Deploy tamamlandı!'
                echo '📍 Backend:  http://localhost:3000'
                echo '📍 Frontend: http://localhost:5173'
                echo '📍 RabbitMQ: http://localhost:15672'
            }
        }
    }

    post {
        always {
            echo '🧹 Pipeline tamamlandı.'
        }
        success {
            echo '✅ Tüm aşamalar başarıyla tamamlandı!'
        }
        failure {
            echo '❌ Pipeline başarısız oldu!'
            sh 'docker compose -p savora -f ${DOCKER_COMPOSE_FILE} down || true'
        }
    }
}

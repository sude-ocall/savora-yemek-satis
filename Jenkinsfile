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

        // ─── Aşama 2: Bağımlılıkları Yükleme ───────────────────────────────
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo '📦 Backend bağımlılıkları yükleniyor...'
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        echo '📦 Frontend bağımlılıkları yükleniyor...'
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        // ─── Aşama 3: Build ─────────────────────────────────────────────────
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

        // ─── Aşama 4: Test ──────────────────────────────────────────────────
        stage('Test') {
            steps {
                echo '🧪 Testler çalıştırılıyor...'
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} up -d'

                // Servislerin ayağa kalkmasını bekle
                sh 'sleep 15'

                // Backend health check
                sh 'curl -f http://localhost:3000/api/products || exit 1'
                echo '✅ Backend sağlık kontrolü başarılı!'

                // Frontend health check
                sh 'curl -f http://localhost:5173/ || exit 1'
                echo '✅ Frontend sağlık kontrolü başarılı!'
            }
        }

        // ─── Aşama 5: Deploy ────────────────────────────────────────────────
        stage('Deploy') {
            steps {
                echo '🚀 Uygulama deploy ediliyor...'
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} down'
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} up -d --build'
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
            sh 'docker compose -f ${DOCKER_COMPOSE_FILE} down || true'
        }
    }
}

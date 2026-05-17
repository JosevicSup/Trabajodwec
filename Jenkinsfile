pipeline {
    agent any

    environment {
        // Obtenemos el Token de Firebase desde las credenciales globales secretas de Jenkins
        FIREBASE_TOKEN = credentials('firebase-token-secret')
    }

    stages {
        stage('Instalacion de Dependencias') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm install'
                    } else {
                        bat 'npm.cmd install'
                    }
                }
            }
        }

        stage('Analisis de Codigo (Linter)') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run lint'
                    } else {
                        bat 'npm.cmd run lint'
                    }
                }
            }
        }

        stage('Pruebas Unitarias') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run test:unit'
                    } else {
                        bat 'npm.cmd run test:unit'
                    }
                }
            }
        }

        stage('Compilacion del Proyecto') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm.cmd run build'
                    }
                }
            }
        }

        stage('Despliegue en Firebase Hosting') {
            steps {
                script {
                    if (isUnix()) {
                        sh "npx firebase-tools deploy --token \"${FIREBASE_TOKEN}\" --non-interactive"
                    } else {
                        bat "npx.cmd firebase-tools deploy --token \"${FIREBASE_TOKEN}\" --non-interactive"
                    }
                }
            }
        }
    }

    post {
        success {
            echo '¡Pipeline ejecutado con éxito! El juego está desplegado y online.'
        }
        failure {
            echo 'Error detectado en alguna etapa del pipeline. Por favor revisa los logs.'
        }
    }
}

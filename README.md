# Projet-Cluster-Redis

# Structure du cluster
#   -3 Noeuds maîtres ayant chacun un esclave
#   -Un noeud pour héberger la page permettant d'effectuer les opérations CRUD dans la base de données http://127.0.0.1:5000/
#   -Un noeud pour héberger Redis-Commander qui nous permettra de gérer l'activité des différents noeuds http://127.0.0.1:4000/

# Mise en marche des container
#Executez simplement la commande "docker-compose up" pour mettre en marche les conteneurs Docker

docker build -t app .
docker run -p 6080:80 -e DATABASE_URL='random_URI' -e RESOLUTION=1920x1080 -e GITHUB_SHA='random_sha' -e TEST_NUMBER=1 -d  --name crusher app
docker exec -d crusher recordmydesktop --on-the-fly-encoding --no-sound
docker exec crusher npm start
docker exec crusher cat results.md > results.md
docker stop crusher
docker rm crusher
docker stop crusher
docker rm crusher
docker build -t app .
docker run -p 6080:80 -e RESOLUTION=1920x1080 -e GITHUB_SHA='random_sha' -e TEST_NUMBER=1 -d  --name crusher app
sleep 4
echo "Build Complete"
docker exec -d crusher recordmydesktop --on-the-fly-encoding --no-sound
sleep 2
docker exec crusher npm run test
docker exec crusher cat results.md 
docker exec crusher ls

# docker exec crusher node -e 'let e=require("./search_google.com.json");console.log(e)'
# docker exec crusher node -e 'let e=require("./tests/google.com/search.json`");console.log(e)'
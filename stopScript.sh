while true; 
do 
  STAT="$(docker exec crusher grep -w ".*" -c tests.txt)"
  # More than 4 lines
  if [ "$STAT" -gt "4" ]; then
    echo "Done"
    docker stop crusher
    break # or add more commands to finilize the process
  fi
  sleep 60; 
done



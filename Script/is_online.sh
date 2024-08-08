#!/bin/bash

function online {
  ## Test if online - prototype code
  wget -q -O /dev/null --timeout=1  google.com
  return $?
}

until online
do
  echo "no internet connection?!"
  sleep 1
done

echo "online!!"

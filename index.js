#! /usr/bin/env node
import * as p from '@clack/prompts';
import { type } from 'os';
import color from 'picocolors'
import {setTimeout} from 'timers/promises';
import { formatDistanceToNow } from 'date-fns';
import { title } from 'process';

const types = ['PushEvent', 'CreateEvent', 'WatchEvent']

const fetchActivities = async (username) => {
  try {
  const url = `https://api.github.com/users/${username}/events`
  const response = await fetch(url);
  const data = await response.json();
  return data;
  }
  catch(error){
    console.log(color.red('Some error ocurred while fetching the data'))
  }
}

function analizeActivities(actions){
  for(let action of actions){
    if(action.type === 'PushEvent'){
      console.log(color.green(`Pushed ${action.payload.commits.length} commits to ${action.payload.ref} at ${action.repo.name}`), color.white(`- ${formatDistanceToNow(action.created_at, {addSuffix: true})}`))
    }
    if(action.type === 'CreateEvent'){
      console.log(color.green(`Created ${action.payload.ref_type} ${action.payload.ref} at ${action.repo.name}`))
    }
    if(action.type === 'WatchEvent'){
      console.log(color.green(`Starred ${action.repo.name}`))
    }
}
}


async function main() {
  p.intro('Welcome to Github Activity CLI', 'A CLI tool to get the latest activities of a Github user')
  const username = await p.text({message: 'Enter the Github username', placeholder: 'guilhermezuriel', defaultValue: 'guilhermezuriel'});
  console.log(color.bold(`Fetching the latest activities of ${username}...`))
  const data = await fetchActivities(username);
  analizeActivities(data);
  p.outro('Thanks for using Github Activity CLI', 'Hope you liked it!')
}

main();
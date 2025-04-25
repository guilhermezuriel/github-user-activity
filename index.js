#! /usr/bin/env node
import {log, intro, outro, spinner, multiselect, text, select } from '@clack/prompts';
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
      log.step(color.green(`Pushed ${action.payload.commits.length} commits to ${action.payload.ref} at ${action.repo.name}`), color.white(`- ${formatDistanceToNow(action.created_at, {addSuffix: true})}`))
    }
    if(action.type === 'CreateEvent'){
      log.step(color.green(`Created ${action.payload.ref_type} ${action.payload.ref} at ${action.repo.name}`))
    }
    if(action.type === 'WatchEvent'){
      log.step(color.green(`Starred ${action.repo.name}`))
    }
}
}

const userRepoRegex = /^([^/]+)/

function extractRepoName(actions, username){
  const repoNames = actions.map(action => action.repo.name).filter(user=> {
    return user.match(userRepoRegex)[1] === username;
  });
  const uniqueRepoNames = [...new Set(repoNames)];
  return uniqueRepoNames.map(repo => ({value: repo}));
}


async function main() {
  intro('Welcome to Github Activity CLI', 'A CLI tool to get the latest activities of a Github user')
  const choose = await select({message: 'Select the types of activities you want to see', options: [{value:'public'}, {value:'private'}], defaultValues: ['public', 'private']});
  const s = spinner();
  if(choose.includes('public')){
     const username = await text({message: 'Enter the Github username', placeholder: 'guilhermezuriel', defaultValue: 'guilhermezuriel'});
    
     s.start(color.bold(`Fetching the latest public activities of ${username}...`));
     const data = await fetchActivities(username);
     s.stop(); 
     const selectType = await select({message: 'Select the type of activities you want to see', options: [{value:'all',label:'All activities'}, {value:'repo', label:'Repositorie activities'}, {value:'Last commits'}], defaultValue: 'All activities'});
      if(selectType === 'all'){
        analizeActivities(data);
      }
      if(selectType === 'repo'){
        const latestRepo = extractRepoName(data, username);
        const selectLatestRepos = await select({message: 'Select the repository you want to see the activities', options: latestRepo});
        console.log(color.green(`Fetching the latest activities of ${selectLatestRepos}...`));
        const filteredData = data.filter(action => action.repo.name === selectLatestRepos);
      }
  }




  // const data = await fetchActivities(username);
  // analizeActivities(data);
  outro('Thanks for using Github Activity CLI', 'Hope you liked it!')
}

/*
IMPROVMENT IDEAS:
- Add more types of activities
- Add more options to the user
- Add more information to the user
- Add more colors to the output
- Add more error handling
- Add more tests
- Add more documentation


- Add visual template of github's activity board
- Should be able to choose between public activities, log in to see private repositories
- Using ssh authentication to fetch data and provide more information
- Logging via terminal to get token and provide more information
- Stabelish goals of activities, stored in a repository on github and fetch data from it
- Review the goals to see if they are being met
- List commits made by that user of a specific repository, branch, etc 
- Organization mode, to quickly see the activities of the members involved

*/

main();
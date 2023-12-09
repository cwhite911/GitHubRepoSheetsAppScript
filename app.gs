function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom')
      .addItem('Add Repo', 'loadGitHubRepo')
  .addToUi();
}

function loadGitHubRepo() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheets()[0];
  var activeRange = sheet.getActiveRange();
  const activeRangeData = activeRange.getValues();
  Logger.log(activeRangeData)

  const gitRepoUrlData = sheet.getActiveCell();
  const gitRepoUrl = gitRepoUrlData.getValue()
  Logger.log(gitRepoUrl)
  const BASE_GITHUB_URL = "https://api.github.com/repos"

  let parsedGitRepoUrl = gitRepoUrl.split("/")
  console.log(parsedGitRepoUrl)
  const REPO = parsedGitRepoUrl.pop()
  const OWNER = parsedGitRepoUrl.pop()

  // Request Basic Info about Repo
  let profileUrl = `${BASE_GITHUB_URL}/${OWNER}/${REPO}` 
  
  // Request Release Data
  let releaseUrl = `${BASE_GITHUB_URL}/${OWNER}/${REPO}/releases` 

  // Request Contributor Data
  let contribUrl = `${BASE_GITHUB_URL}/${OWNER}/${REPO}/contributors` 

  let writeData = {
    'Name': REPO,
    'Owner': OWNER,
    'Repo': gitRepoUrl
  }
  let responses = UrlFetchApp.fetchAll([profileUrl, releaseUrl, contribUrl])
  for(i in responses) {
    let responseJson = responses[i].getContentText();
    let data = JSON.parse(responseJson);
    Logger.log(i)
    if (i == 0) {
      Logger.log(data)
      writeData = Object.assign(writeData, {
        'Created': data.created_at,
        'Updated': data.updated_at,
        'Last Push': data.pushed_at,
        'Purpose': data.description,
        'Technology': data.language,
        'Type': data.topics.join(", "),
        'Fork': data.fork,
        'Forks': data.forks_count,
        'Stars': data.stargazers_count,
        'Size':  data.size,
        'Open Issues': data.open_issues_count,
        'Documentation': data.homepage,
        'License': data.license ? data.license.spdx_id : null,
        'Size': data.size
      })
    }

    // Set contributor data
    if (i == 1) {
      Logger.log(data)
      writeData = Object.assign(writeData, {
        'Release': data[0] ? data[0].tag_name : null,
        'Release Date': data[0] ? data[0].published_at : null
      })
    }

    // Set contributor data
    if (i == 2) {
      writeData = Object.assign(writeData, {
        'Contributors': data.length
      })
    }
  }

  console.log(writeData)

  let stats = [
    writeData.Name, writeData.Owner,
    writeData.Purpose, 
    writeData.Repo,
    writeData.Release,
    writeData['Release Date'],
    writeData.Technology, writeData.Type, 
    writeData.Created, writeData.Updated, writeData['Last Push'],
    writeData.Fork, writeData.Forks,
    writeData.Stars, writeData.Size, 
    writeData.Contributors,
    writeData['Open Issues'], 
    writeData.Documentation,
    writeData.License
  ]

  sheet.appendRow(stats)
	// return stats						
}
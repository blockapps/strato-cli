## strato-cli
CLI tool for easily deploying app bundles to the STRATO blockchain

#### Follow these instructions to setup and begin developing applications on the STRATO Blockchain

#### Pre-requisites:

- Node JS (Version 6 and up)
- Your favorite code editor for solidity (our team uses Sublime or Atom)
- BlockApps User Account
- Create a user on BlockApps Testnet - follow the instructions here.
##### Note: Don’t forget to faucet your account.


#### Install CLI Tool:

Open your terminal and install the STRATO CLI Tool from the NPM repository, run:

```
npm install -g strato-cli
```

Test your installation by running the command 
	
```
strato --version
```

#### Deploy Test App to STRATO Network (Public Blockchain):

Configure the CLI Tool to deploy applications to the STRATO Blockchain by running

```
strato config
```

You will be prompted for a `<username>`, type in your username and press [Enter]

Press [Enter] to configure the CLI Tool to use the BlockApps STRATO Public Default Host.

Download the Test dApp to your system and configure the App Bundle
	
```
strato init
```

You will be prompted for bundle information, complete as follows:

```
app title: <any title>
app description: <any description>
Version: <any version number>   
email: <your email address>
```

Completing this step will create a new folder with the `app’s title` in the current directory.

`cd` into the app directory and review the file contents, you should have the following:

```
app directory
├─ contracts/
│   └─ ...all solidity contract files (*.sol)
│
├─ metadata.json
│
└─ index.html
```

Upload the sample app to the STRATO Blockchain by running the following command from your home directory

```
strato upload /path/to/<app name>
```

You will be prompted for a `password` for the STRATO User you created at the start of this guide.

Upon successful upload of the application, you will receive the following response including the URL of the deployed app:

`
application successfully deployed with url http://stratodev.blockapps.net/apps/<unique url>
`

The app will be visible in the App Launchpad, you can view it and use it by navigating to:

`http://stratodev.blockapps.net/dashboard/#/apps`


#### For additional commands for the STRATO CLI Tool, run:

```
strato --help
```

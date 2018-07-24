# STRATO CLI Tool

Used to easily deploy app bundles to the STRATO Blockchain

#### Follow these instructions to setup and begin developing applications on the STRATO Blockchain

#### Pre-requisites:

- Node JS (Version 6 and up)
- Your favorite code editor for solidity (our team uses Sublime or Atom)

### 1. Install CLI Tool:

Open your terminal and install the STRATO CLI Tool from the NPM repository, run:

```
npm install -g strato-cli
```

Test your installation by running the command

```
strato --version
```

### 2. Configure CLI Tool:

In order to configure the CLI Tool, we need to provide the STRATO Blockchain host where the app bundle will be deployed.

You can use STRATO Public Network running at https://stratodemo.blockapps.net or you can run own local instance of STRATO using https://github.com/blockapps/strato-getting-started

##### For Strato Public Network:

```
Create a Developer account on STRATO Public Network https://stratodemo.blockapps.net

Faucet your account after login to your account from `Account` Tab
```

##### For Strato Local/Custom Network:

```
Create an account on STRATO Local/Custom Network by following the sign-up process

Faucet your account after login to your account from `Account` Tab
```

##### Note: Don’t forget to faucet your account

Now run the below command

```
strato config
```

You will be prompted for a `<username>`, type in your username of the account created above

For `<hostname>` you will be prompted to press [Enter] or [Space] as below

##### For Strato Public Network:

```
Press [Enter] to configure the CLI Tool to use the STRATO Public Network as Default Host (stratodemo.blockapps.net)
```

##### For Strato Local/Custom Network:

```
Press [Space] to configure the CLI Tool to use the your http://Localhost or Custom hostname
```

### 3. Create Sample dApp using CLI Tool:

Use the following to download the Test dApp to your system and configure the App Bundle

```
strato init
```

You will be prompted for bundle information, complete as follows:

```
app title: <any title>
app description: <any description>
version: <any version number>
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


### 4. Upload app bundle using CLI Tool:

Upload the app to the STRATO Blockchain by running the following command from your home directory where `<app name>` is the folder created in above steps.

For example if the `app's title` in the above steps is SampleApp in my home folder then upload command will be `strato upload SampleApp`

```
Linux/Mac
strato upload path/to/<app name>

Windows
strato upload path\to\<app name>
```

You will be prompted for a `password` for the STRATO User you created at the start of this guide.

Upon successful upload of the application, you will receive the following response including the URL of the deployed app:

`
application successfully deployed with url http://<hostname>/apps/<unique url>
`

If using `Strato Public Network` the app will be visible in the App Launchpad, you can view it and use it by navigating to: http://stratodemo.blockapps.net/dashboard/#/apps

### 5. Check User Balance using CLI Tool:

Balance will displayed in `wei` for configured user

```
strato balance
```

### For additional commands for the STRATO CLI Tool, run:

```
strato --help
```

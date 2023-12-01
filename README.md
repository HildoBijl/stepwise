# Step-Wise

This documentation is for developers. It explains the components Step-Wise consists of and how you can potentially contribute.


## Components

The Step-Wise code-base is split up into four main directories.

- **[The back-end API](api/).** This GraphQL API is responsible for tracking all user data. Whenever a user attempts a log-in or submits an exercise, a call is made to the server, which then deals with it appropriately.
- **[The front-end app](frontend/).** This is the largest folder: everything you see on the screen while using the app is in this folder.
- **[The shared directory](shared/).** Whenever both the API and the front-end require a certain piece of code, it's placed in the shared directory. Think of utility Javascript functions, [educational functions](shared/edu/) (like whether an exercise submission is correct), various [input data types](shared/inputTypes/), our [skill tracking algorithm](shared/skillTracking) and physical constants.
- **[The ops folder](ops/).** This is used for all operational tasks, like releasing new versions of the app through continuous deployment, checking server logs and more.

A few systems span more than just one directory. If you want to learn more about these systems, check out their individual documentation, ideally in the order in which they appear below.

- **[The skill tree.](shared/eduTools/skills/)** This is the foundation of Step-Wise. In Step-Wise all educational content is split up into skills to master. When a teacher sets a goal (e.g., an advanced skill) the app then automatically knows which skills (e.g., basic skills) the students should practice first. This readme file also discusses how to optimally select exercises to practice.
- **[The exercise system.](shared/eduTools/exercises/)** Every skill has a multitude of exercises connected to it. Each exercise is randomly generated. This allows for a huge variety of exercises for the student to practice with.
- **[The input system.](shared/inputTypes/)** Step-Wise uses a manually programmed system for inputs, allowing us to have very intuitive input fields as well as easy processing of the provided data. 
- **[Skill tracking.](shared/skillTracking/)** For every skill, the app tracks/estimates the chance that a student will correctly apply this skill in an upcoming exercise. This always gives us up-to-date data on the student progress.
- **[Course system and skill recommendation.](frontend/src/ui/eduTools/)** In most universities, subjects are grouped into a "course". Each course then has various "chapters". To accommodate this, Step-Wise also has a course system working in exactly the same way. Within courses, the Step-Wise system intelligently recommends students which skills to practice.
- **[Computer Algebra System (CAS)](shared/CAS/)** To evaluate and check mathematical relations, Step-Wise has developed its own Javascript-based CAS.

When developing Step-Wise, we adhere to a few [principles](philosophy.md). These principles may help you understand some of the design decisions made in the app. 


## Setting up Step-Wise locally

If you want to do coding in the Step-Wise app, you first have to get the code running locally. To achieve that, follow the following steps.

- Make sure you have [Node](https://nodejs.org/en/download/) and the [Git CLI](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on your computer.
- Clone the directory to your local drive. Use `git clone https://github.com/HildoBijl/stepwise.git` in a terminal/command-prompt window.
- For the front-end, perform the following steps.
	- Find the `.env-template` file in the front-end folder and copy it as `.env`. This contains the environment settings for the front-end. The `.env-template` file should have the right data for your local development.
	- For the front-end we use the [create-react-app](https://github.com/facebook/create-react-app) tool. To make sure all the dependencies are installed, run `npm install`. (This may take a few minutes. Of course if you prefer `yarn install` that is possible too.)
	- Afterwards, use `npm start` to start up the development tool. This should (after a minute or so) open up a browser window with the local website running.
- For the API, perform the following steps.
	- Make sure you have a [PostgreSQL database](https://www.postgresql.org/download/) installed on your computer.
	- Find the `.env-template` file in the API folder and copy it as `.env`. In this file, enter the database details for your local PostgreSQL installation.
	- Take a new terminal/command-prompt window and run `npm install` to install dependencies.
	- To start up the server, use `npm run dev`. This runs the server in development mode: it restarts the server on a file change.

Afterwards you're good to go! Everything should be up and running. Did you run into any problems? Drop us a note at <info@step-wise.com> and we will update the above steps.


## Contributing

Contributions are always welcome! These could range from minor bug fixes in exercises to completely new components for students to interact with.

Before you start programming your own extensions, it may be worth while to get in touch through <info@step-wise.com> to see if they match our [design philosophy](philosophy.md). It would be sad if your contributions didn't match our other plans.

Got your fix/update ready? Just send in a pull request! Hopefully your work will be merged into the master branch and deployed right away.


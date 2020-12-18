# Step-Wise philosophy

At Step-Wise we adhere to a couple of principles which guide our decisions. You can read about them below.


## World philosophy

We are proponents of free, personal and open education for everyone, irrespective of origin. Our goal is to help as many people as possible at learning and mastering new skills. That is why all Step-Wise source code is freely available under an [MIT license](LICENSE). Openness and transparency are key.


## Design philosophy

When designing the front-end of our app, we always place the *student experience first*. Many others platforms are built from a programmer's perspective: "The database has courses set up like this, so let's show them in this way to our students too!" We do not agree. Instead, when designing new features, we first always check which design, set-up and interaction works best for students. The architecture to set this up then just has to follow accordingly. And if it's more difficult to code it all, then we'll just have to deal with it. Student experience always comes first.

A consequence of this is that our user interface is as intuitive as possible. We don't believe in manuals, documentations and tutorials for our end-users. No one ever reads a manual in this age anyway. The interface should be clear from the get-go. And if it is not 100% obvious how everything works right away, the interface should invite users to experiment and figure things out for themselves.

To accomplish this, we make heavy use of the [Material UI](https://material-ui.com/) toolbox. This allows us to have intuitive icons, clever tooltips and well-formatted buttons. However, if the Material UI toolbox is not sufficient, we do not hesitate to create our own components. All our input fields are hand-programmed to give the best user experience possible.


## Educational philosophy

Step-Wise is all about getting students to be active. We ask ourselves: what behavior/skills do we want students to have and display at the end of the course? Then we set up exercises in which students have to show exactly the behavior we aim for them to learn. Nothing more, nothing less. No knowledge tests, no rote learning, no boring memorization. Because when students are active, doing things that make sense, learning feels more effective, useful and above all fun.

Once we have exercises set up for the end-goals of the course, we look at the steps involved in tackling these exercises. We split each exercise up into steps. For each of these steps, we then look at what skills are required to solve each specific step. For each of these subskill, we create more exercises, so that students can practice with individual subskills too. This organically creates our learning tree.

This process continues until we reach skills that are basic enough that we can reasonably assume students entering the course already master them. These skills then describe the prior knowledge needed for the course. Of course each prior knowledge skill has exercises too so that, if a student struggles with prior knowledge, he/she can practice with those too. In this way no one is left behind struggling.


## Code development philosophy

Quick iterations are at the key of our software development. When developing new features, it is very tempting to come up with a grand design, but this only increases the risk of never seeing it finished. Instead, we aim to develop new features in a minimal fashion first, so that we can start checking our design assumptions. It allows us to deploy extensions quickly, get direct feedback from our users, and adjust functionalities to their needs as we continue to expand.

A similar approach is taken to database usage. When we add new features, like courses, we first hard-code them. After all, initially the number of courses is still small. Why add them to the database (requiring database migrations, a new API endpoint and more) when you can solve the problem with a single JSON file? Only when new functionalities require database usage do we extend our database. Again, this allows us to quickly deploy and experiment with new features, while preventing potentially useless and wasted work.


## Privacy philosophy

We have two fundamental principles revolving around privacy.

- **Need to know:** you only get access to the specific data you need to accomplish your goals. In this way no one ever gets access to data they should not have access to.
- **Ask when required:** only when you perform an action that will give others access to your data (like logging in or enrolling in a course) do we ask you for approval. Not before, and not after. This ensures that you always know what you give approval to and why.

These principles ensure that the privacy of our users is properly taken care of. They form the basis of our [privacy policy](frontend/public/PrivacyPolicy.pdf) and we keep them in mind whenever we deal with user data.
User Persona: Junior / Senior high school student trying to learn the basics of an advanced competitive programming concept
User story:
- I am a Junior in highschool who is trying to wrap my head around dynamic programming so I want an interactive lesson so that I can start doing easy problems with the concept
Domain: Dynamic Programming

Functionality:
- 3 Pages: Home, Courses, Course page, Profile
- Home - Shows ongoing courses and progress
  - Something like: Box showing current lesson number, name, and percentage progress in entire course as progress bar
- Courses: ONLY the DP option for now.
- Course Page: Box with course title and description, as well as lessons in the course in sequential order. The progress of the course should be able to be seen 
- Persistence: Must store the current lesson and part of lesson on, should store into database
- Mobile responsiveness
- Tech stack is Firebase + React
- All lessons have minimal wording. Focus on interaction
- Per each lesson, there are slides. Per each slide, there is only one concept or activity
- After lesson ends, have a congrats screen. 

Lesson:
- Focus on understanding dynamic programming in an iterative manner
- Start with iterative solution (bottom-up), rather than traditional memoization
- Ideas:
  1. Start with the stair step problem. 
    - You start out on the ground (height 0), given that you can only go up 3 steps or 5 steps at a time, how do you figure out if you can make it to step 11
  2. Display 11 squares (would be better if it was acc stairs) that are contiguous, representing the stairs. User can place an X or a checkmark based on if you can reach the slot
    - To select a square to choose, they can click on it. They can also just start dragging if they would like. 
    - When they click on a square there should be some sort of indicator on the stair steps that are currently 3 or 5 below (highlighting or outlining or smtn), so they know the general idea of only checking those squares for the current state
    - Allow them to check if they get the right answer for the 11th step
  3. EXPLANATION STEP: Dynamic programming mimics the human brain -- we can build up from the **bottom-up** in order to discover what the end state is
    - Instead of starting from the beginning for each new step, we see if the possible previous states enable this one to be true. 
  3. Convert stairs into an array, and show how an array can be used to store the stair validity (each element in the array represents a different state, lets make it a boolean array)
  4. Solidify thinking: Give a new scenario -> You can jump up 2-4 steps. 
    - The interactive part is dragging a range (2 draggable circles, can't overlap each other) over 5 squares on an end point of what would constitute the value
    - What immediate range would you check over F(1) to F(10) if you are looking for if F(11) is valid

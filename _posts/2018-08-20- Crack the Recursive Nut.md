---
layout: archive
author: aakash
title: Crack the Recursive Nut
permalink: /CracktheRecursiveNut/
---



## Your Guide to Recursion in Any Programming Language

In this blog, I will cover why and how recursion thinking is necessary for all engineers out there and how it helps tackle dynamic business problems.

## Types of Recursion

There are two types of recursion:
1. Direct
2. Indirect

### Direct Recursion

Direct recursion is when something happens again and again, each time with something a little different, like a smaller version of itself. It's like a funhouse mirror that keeps reflecting your image, making it smaller and smaller with each reflection.

Here is a simple explanation in Java:

```java
public class FunhouseMirror {

    public static void funhouseMirror(int n) {

        // Base case - stop when n gets to 0
        if(n == 0) {
            return;
        }

        System.out.println("Image size: " + n);

        // Recurse by calling funhouseMirror with a smaller n
        funhouseMirror(n-1); 
    }

    public static void main(String[] args){
        // Call funhouse mirror with n = 5
        funhouseMirror(5);
    }
}
```

Here's a simple Python explanation:

```python
def funhouse_mirror(n):
    # Base case - stop when n gets to 0
    if n == 0:
        return
    print("Image size: " + str(n))
    # Recurse by calling funhouse_mirror with a smaller n
    funhouse_mirror(n-1)

# Call funhouse mirror with n = 5
funhouse_mirror(5)
```

### Indirect Recursion

Imagine you and your friends are playing a game of tag. You're trying to tag someone, but they keep running away. Then, they tag another friend, and that friend starts chasing you! Now you're the one running away. That's kind of like indirect recursion.

In indirect recursion, something calls something else, which calls something else, which eventually calls back to the first thing. It's like a chain reaction, where each action triggers another action, and it keeps going until something stops it.

Here's a simple Java code that explains how it works:

```java
public class ChainReaction {

    // Number of players in the game
    static int players = 5;

    // Method representing a player being "it" and trying to tag someone else
    public static void tag(int player) {
        // If there are no more players left to tag, the game ends
        if (players == 0) {
            System.out.println("Game Over!");
            return;
        } else {
            // Print out which player is "it"
            System.out.println("Player " + player + " is it!");
            // Decrease the number of players
            players--;
            // The player who is "it" starts running
            run(player);
        }
    }

    // Method representing a player running away
    public static void run(int player) {
        // Print out which player is running away
        System.out.println("Player " + player + " is running away!");
        // If the player who is "it" is the same as the player who is running,
        // the next player becomes "it". Otherwise, the same player remains "it".
        if (player == players) {
            tag((player % players) + 1);
        } else {
            tag(player);
        }
    }

    // Main method to start the game
    public static void main(String[] args) {
        // Player 1 starts as "it"
        tag(1);
    }
}
```

## A similar concept works with Python as follows:

```python
class ChainReaction:

    # Number of players in the game
    players = 5

    @staticmethod
    def tag(player):
        # If there are no more players left to tag, the game ends
        if ChainReaction.players == 0:
            print("Game Over!")
            return
        else:
            # Print out which player is "it"
            print(f"Player {player} is it!")
            # Decrease the number of players
            ChainReaction.players -= 1
            # The player who is "it" starts running
            ChainReaction.run(player)

    @staticmethod
    def run(player):
        # Print out which player is running away
        print(f"Player {player} is running away!")
        # If the player who is "it" is the same as the player who is running,
        # the next player becomes "it". Otherwise, the same player remains "it".
        if player == ChainReaction.players:
            ChainReaction.tag((player % ChainReaction.players) + 1)
        else:
            ChainReaction.tag(player)

# Main method to start the game
if __name__ == "__main__":
    # Player 1 starts as "it"
    ChainReaction.tag(1)
```

## What is Recursion and Why is it Necessary?

Here is an explanation of recursion:

The key idea behind recursion is that a problem can be solved by reducing it into smaller subproblems of the same kind. Just like when you stand between two parallel mirrors and you see infinitely repeating images of yourself, recursive solutions work by functions calling themselves.

The base case and recursive step are the two components that allow this to work:

### Base Case

This is the simplest possible input for the problem, one where you already know the answer without needing recursion. The base case allows the recursion to bottom out and stop calling itself. Without a base case, the function would go into an infinite loop!

For example, `factorial(1) = 1` is a common base case.

### Recursive Step

This decomposes the original problem into smaller subproblems of the same kind. It calls the function itself recursively, getting closer and closer to one of the base cases.

For example, `factorial(5)` will recursively call `factorial(4)` to get closer to the base case of `factorial(1)`.

By having a function call itself with smaller inputs, the recursion unwinds once we reach a base case. All recursive functions have these two essential parts. The combination allows for elegant and efficient solutions by breaking difficult problems down into simpler repetitive subtasks.

## Analyzing Big O for Recursion

Here's a simple explanation of how to analyze the runtime efficiency of a recursive function using Big-O notation:

The Big-O runtime represents how fast a function grows relative to its input size. For recursive functions, we care about how many recursive calls are made with each increase in input.

For example, imagine a recursive function that is called only once per input. If the input is size N, there would be N recursive calls. This would give us O(N) runtime - linear time, since the number of calls grows proportionally with N.

On the other hand, some recursive functions call themselves more than once per input. A classic example is a function that calls itself twice for each input. If the input size is N, there would be 2^N recursive calls - exponential growth! This exponential recursion has a runtime of O(2^N).

The key idea is that for recursive functions, the number of recursive calls directly impacts how fast the runtime grows. The more times a recursive function calls itself per input, the faster the runtime scales. This is why analyzing recursive algorithm complexity focuses on counting how many recursions occur for each input size N. The growth rate then gives us the Big-O time complexity.

## Stopping Recursive Thought: Strong vs. Weak Base Cases

Here's a simple explanation of a weak base case in a recursive function:

A recursive function relies on having a strong base case that allows it to stop calling itself eventually.

For example, let's think about a recursive function that calculates the factorial of a number, like `factorial(5)`.

A good base case would be:

```java
if(number <= 1) {
    return 1; 
}
```

This provides a stopping condition when the number drops to 1 or below, allowing the function to stop recursing and unwind back to the original call.

A weak base case would be:

```java
if(number < 0) {
    return 1;  
}
```

This base case doesn't work because the number will never become negative when calculating factorials. The function will recurse forever, trying larger and larger positive numbers, until the call stack overflows and crashes the program with a stack overflow error.

So, in summary, a weak base case fails to end the recursion, causing the function to recurse indefinitely until the program runs out of memory and crashes. Defining a proper base case that handles the smallest valid input is essential for building a robust recursive function.

## Conclusion

I hope you found this overview of recursion, runtime analysis, and base cases to be helpful! Mastering recursion is critical for success in technical interviews and writing efficient programs.

If you have any other questions or topics you'd like me to cover, feel free to reach out on LinkedIn or Twitter.

If you're preparing for an upcoming coding interview, I also offer tailored 1:1 mentoring sessions to practice problems and optimize your interviewing approach. You can book a free 30-minute trial session with me through Preplaced.

Thanks again for reading!
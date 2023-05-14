# Language Design Proposal

Similar to C, this language is implemented with the ability to do basic calculations. The main goal of this program is not so much for the purpose of creating an in-depth, highly complicated language, but rather one that is accessible to those who don't have access to a proper educational environment in the computer science field. Currently this language is extremely primitive and scheme-like, but it is continuously being edited and made better. 

Right now there's an error with the typechecker which will require a lot of additional function creation, but that's something that I will get to within the next few weeks. 

### Syntax

```
This syntax has been copied from Lab 6 of CSC-312
x, f are identifiers; n is a number; b is a boolean

t ::= Nat | Bool | (-> t1 t2) | (Rec f1 t1 ... fk tk)

e ::= x | n | b
    | (lambda x t e)
    | (e1 .. ek)
    | (if e1 e2 e3)
    | (re`c f1 e1 ... fk ek)
    | (field e f)

v ::= n | b | (lambda x t e) | (rec f1 v1 ... fk vk)

s ::= (define x e) | (display e)

prog ::= s1 ... sk
```

### Dynamic Semantics

```
σ is the runtime environemnt

x:v ∈ σ
---------
σ; x ⇓ v

σ; e1 ⇓ true    σ; e2 ⇓ v
-------------------------
σ; (if e1 e2 e3) ⇓ v

σ; e1 ⇓ false    σ; e2 ⇓ v
--------------------------
σ; (if e1 e2 e3) ⇓ v

σ; e1 ⇓ (lambda (x t) e)
σ; e2 ⇓ v
σ; [v/x] e ⇓ v'
---------------------
σ; (e1 e2) ⇓ v'

σ; e ⇓ (f1 v1 ... f v ... fk vk)
--------------------------------
σ; (field e f) ⇓ v
```

### Typechecking

```
Γ is the typechecking context

x:t ∈ Γ
---------
Γ ⊢ x : t

-----------
Γ ⊢ n : Nat

-----------
Γ ⊢ b : Bool

x:t1, Γ ⊢ e : t2
--------------------------------
Γ ⊢ (lambda x t1 e) : (-> t1 t2)

Γ ⊢ e1 : (-> t1 t2)
Γ ⊢ e2 : t1
-------------------
Γ ⊢ (e1 e2) : t2

Γ ⊢ e1 : t1
...
Γ ⊢ ek : tk
----------------------------------------------------
Γ ⊢ (rec f1 e1 ... fk ek) : (Record f1 t1 ... fk tk)

Γ ⊢ e : (Record f1 t1 ... f t ... fk tk)
----------------------------------------
Γ ⊢ (field e f) : t
```

# Typescript Template

This repository was built from a custom-built template for a console-based [Typescript](https://www.typescriptlang.org) program designed for editing in [Visual Studio Code](https://code.visualstudio.com) or [Github Codespaces](https://github.com/features/codespaces).
Below, we outline the contents of the template for your reference if you need to build your own Typescript project.

## Package Management

We use [NPM](https://npmjs.com) for package management.
The package is initialized with:

~~~console
$> npm init
~~~

With default values given for the `package.json` file that is created.
In particular, a few scripts/sub-commands are given so that building, testing, _etc._, can be run via `npm run`.
See `package.json` to see what these commands do.

Note that the template uses the [Unlicense](https://unlicense.org) license which is replicated in `LICENSE`.
We recommend that you change the license as needed.

## Typescript

The Typescript compiler is installed as a (local) npm development package via `npm`:

~~~console
$> npm install typescript --save-dev
~~~

Development packages are packages that only used during program development, not program execution.

`tsconfig.json` contains default options to the Typescript compiler, `tsc`.
In particular, we specify that source files are contained in the `/src` directory and output files are placed in the `/dist` directory.
See the [tsconfig refeence](https://www.typescriptlang.org/tsconfig) for more information on these options.

## ESLint

We use [ESLint](https://eslint.org) to lint our code.
When coupled with appropriate Visual Studio Code plugin, ESLint provides strong support to enforce style and healthy code practices during development.
We installed `eslint` via the `eslint/config` helper tool:

~~~console
$> npm init @eslint/config
~~~

Arbitrarily, we chose the [Javascript Standard](https://standardjs.com) style for ESLint to enforce.
Feel free to customize this style template or choose a different style altogether.
`.eslintrc.js` contains these settings and the [ESLint user guide](https://eslint.org/docs/latest/use/configure/) provides a comprehensive reference for the file.

## Jest

We use [Jest](https://jestjs.io) as a testing framework for Typescript projects.
There are many such frameworks available; we choose Jest both because of its popularity and its ease of setup and use.

~~~console
$> npm install --save-dev jest ts-jest @types/jest
$> npx ts-jest config:init
~~~

The last command adds a Jest configuration file, `jest.config.js`, to the project.

## Devcontainer Configuration

The `/.devcontainer/devcontainer.json` file configures the runtime instance created when the project is loaded within a Github Codespace.
The file is the default configuration file provided by Microsoft in its [Node.js container template](https://github.com/microsoft/vscode-remote-try-node) with appropriate modifications for these kinds of projects.

Notably, if this project is run in a local version of Visual Studio Code, we recommend installing the following plugins to manage your work:

+   [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
+   [Github Classroom](https://marketplace.visualstudio.com/items?itemName=GitHub.classroom)

## Git Configuration

`.gitignore` is pre-populated so that Git ignores all build files generated by the project.

Love Letter Card Game
================================

###Installation on MAC OSX

#### Install node.js

    $ git clone git://github.com/ry/node.git
    cd node
    ./configure
    make
    sudo make install

#### Install npm (node package manager)

    $ curl https://npmjs.org/install.sh | sh

#### Download the source code

    git clone ~
    cd loveletter

#### Install git commit hooks

    ln -s ../../git-hooks/pre-commit.sh .git/hooks/pre-commit

#### Install dependencies

    npm install
    npm update

#### Start the application

    npm start

# pre-commit hook

# stash
#git stash -q --keep-index

# tests
TEST_RESULT="$(./run_tests.sh)"
FAILURES=$(grep -o '[0-9]\{1,10\} failures' <<< "$TEST_RESULT")
FAILS=$(grep -o '[0-9]\{1,10\}' <<< "$FAILURES")

#stash apply
#git stash pop -q

# working with test result
[ $FAILS -ne 0 ] && echo "$TEST_RESULT"
[ $FAILS -ne 0 ] && exit 1

exit 0
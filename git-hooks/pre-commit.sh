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
if [ "$FAILS" != 0 ]
then
	echo "$TEST_RESULT"
	exit 1
fi

exit 0

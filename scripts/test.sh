#! /usr/bin/env bash

export CI=true

main() {
    run_cmd "git stash push --keep-index --message precommit"
    echo "  If you cancel this pre-push hook, use \`git stash pop\` to retrieve your"
    echo "  unstaged changes."

    eslint="yarn run eslint"
    prettier_ts="yarn run format:tsx"
    prettier_scss="yarn run format:scss"

    run_cmd "${eslint}"; eslint_exit=$?
    run_cmd "${prettier_ts}"; prettier_ts_exit=$?
    run_cmd "${prettier_scss}"; prettier_scss_exit=$?

    run_cmd "git stash pop"

    ( >&2
        echo -ne "\033[0;31m"
        [ "${eslint_exit}" -eq "0" ] || echo "ESLint failed"
        [ "${prettier_ts_exit}" -eq "0" ] || echo "Prettier failed for *.{ts,tsx}"
        [ "${prettier_scss_exit}" -eq "0" ] || echo "Prettier failed for *.scss"
        echo -ne "\033[0m"
    )

    [[ $(( eslint_exit + prettier_ts_exit + prettier_scss_exit )) -eq "0" ]]
}

run_cmd() {
    echo_cyan "> $1"

    print=$($1 2>&1 1> /dev/null)
    exit_status=$?
    if [[ ! -z "${print}" ]]; then
        echo "${print}" | sed 's/^/  /'
    fi

    return "${exit_status}"
}

echo_cyan() {
    echo -ne "\033[0;36m"
    echo "$1"
    echo -ne "\033[0m"
}

main

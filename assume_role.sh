#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <ROLE_ARN> [AWS_REGION]"
    exit 1
fi

ROLE_ARN="$1"
AWS_REGION="${2:-us-east-1}"
SESSION_NAME="my-session"

TEMP_CREDENTIALS_FILE=$(mktemp)

aws sts assume-role --role-arn "${ROLE_ARN}" --role-session-name "${SESSION_NAME}" > "${TEMP_CREDENTIALS_FILE}"

export AWS_ACCESS_KEY_ID=$(jq -r '.Credentials.AccessKeyId' "${TEMP_CREDENTIALS_FILE}")
export AWS_SECRET_ACCESS_KEY=$(jq -r '.Credentials.SecretAccessKey' "${TEMP_CREDENTIALS_FILE}")
export AWS_SESSION_TOKEN=$(jq -r '.Credentials.SessionToken' "${TEMP_CREDENTIALS_FILE}")
export AWS_DEFAULT_REGION="${AWS_REGION}"

aws sts get-caller-identity

# Remove the temporary file
rm "${TEMP_CREDENTIALS_FILE}"

import { Center, Stack } from "@cosmicdapp/design";
import {
  displayAmountToNative,
  getErrorFromStackTrace,
  nativeCoinToDisplay,
  useAccount,
  useSdk,
} from "@cosmicdapp/logic";
import { Coin, isPostTxFailure } from "@cosmjs/launchpad";
import { Typography } from "antd";
import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { config } from "../../../config";
import BackButton from "../../components/BackButton";
import Loading from "../../components/Loading";
import YourAccount from "../../components/YourAccount";
import { pathOperationResult, pathTokens } from "../../paths";
import { OperationResultState } from "../OperationResult";
import FormSendTokens from "./FormSendTokens";
import "./TokenDetail.less";

const { Title, Text } = Typography;

interface TokenDetailParams {
  readonly tokenName: string;
}

export interface TokenDetailState {
  readonly tokenAmount: string;
}

function TokenDetail(): JSX.Element {
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const { tokenName }: TokenDetailParams = useParams();
  const { tokenAmount } = history.location.state as TokenDetailState;

  const { getClient } = useSdk();
  const accountProvider = useAccount();

  const sendTokensAction = (values) => {
    setLoading(true);
    const { address, amount } = values;
    const recipientAddress: string = address;

    const amountToTransfer = displayAmountToNative(amount, config.coinMap, tokenName);

    const nativeTokenToTransfer: Coin = { denom: tokenName, amount: amountToTransfer };
    const transferAmount: readonly Coin[] = [nativeTokenToTransfer];

    getClient()
      .sendTokens(recipientAddress, transferAmount)
      .then((result) => {
        if (isPostTxFailure(result)) {
          return Promise.reject(result.rawLog);
        }

        accountProvider.refreshAccount();

        history.push({
          pathname: pathOperationResult,
          state: {
            success: true,
            message: `${amount} ${tokenName} succesfully sent to ${recipientAddress}`,
            customButtonText: "Tokens",
          } as OperationResultState,
        });
      })
      .catch((stackTrace) => {
        console.error(stackTrace);

        const tokenDetailPath = `${pathTokens}/${tokenName}`;
        const tokenDetailState: TokenDetailState = { tokenAmount };

        history.push({
          pathname: pathOperationResult,
          state: {
            success: false,
            message: "Send transaction failed:",
            error: getErrorFromStackTrace(stackTrace),
            customButtonActionPath: tokenDetailPath,
            customButtonActionState: tokenDetailState,
          } as OperationResultState,
        });
      });
  };

  const nativeToken: Coin = { denom: tokenName, amount: tokenAmount };
  const { denom: nameToDisplay, amount: amountToDisplay } = nativeCoinToDisplay(nativeToken, config.coinMap);
  const [amountInteger, amountDecimal] = amountToDisplay.split(".");

  return (
    (loading && <Loading loadingText={`Sending ${nameToDisplay}...`} />) ||
    (!loading && (
      <Center tag="main" className="Center TokenDetail">
        <Stack className="Stack MainStack">
          <BackButton path={pathTokens} />
          <Stack className="Stack AccountStack">
            <Title>{nameToDisplay}</Title>
            <YourAccount showTitle={false} />
          </Stack>
          <div className="Amount">
            <Text>{`${amountInteger}${amountDecimal ? "." : ""}`}</Text>
            {amountDecimal && <Text>{amountDecimal}</Text>}
            <Text>{" tokens"}</Text>
          </div>
          <FormSendTokens
            tokenName={nameToDisplay}
            tokenAmount={amountToDisplay}
            sendTokensAction={sendTokensAction}
          />
        </Stack>
      </Center>
    ))
  );
}

export default TokenDetail;

interface RunItContentProps {
	commandLines: string[];
	explanation: React.ReactNode;
}

export function RunItContent({ commandLines, explanation }: RunItContentProps) {
	return (
		<>
			<div className="codeBlockMulti">
				<pre>{commandLines.join("\n")}</pre>
			</div>
			{explanation}
		</>
	);
}

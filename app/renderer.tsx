"use client";

import React from "react";
import init, { greet } from "./renderer/renderer"

export default function Renderer() {
	React.useEffect(() => {
		(window as any).test_function = (x: number) => {
			console.log("HI " + x);
			return x + 1;
		}
		init();
	});

	return (
		<canvas id="game-canvas" width="800" height="600"></canvas>
	)
}
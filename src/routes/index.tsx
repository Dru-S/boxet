import {
  component$,
  useSignal,
  useTask$,
  $,
  useComputed$,
} from "@builder.io/qwik";
import { DocumentHead } from '@builder.io/qwik-city';
import logo from '/src/assets/logo.svg?raw'

export const head: DocumentHead = {
  title: 'Boxet — Box for text',
};

export default component$(() => {
  const commentsOpen = useSignal(`# `);
  const commentsClose = useSignal(``);
  const text = useSignal(``);
  const rows = useSignal(1);
  const boxed = useSignal(``);
  const padding = useSignal(1);
  const boxType = useSignal(0);
  const copied = useSignal(false);

  const placeholder = `Enter text`;

  const boxTypes = [
    [
      [`+`, `-`, `+`],
      [`|`, ` `, `|`],
      [`+`, `-`, `+`],
    ],
    [
      [`•`, `-`, `•`],
      [`|`, ` `, `|`],
      [`•`, `-`, `•`],
    ],
    [
      [``, `-`, ``],
      [``, ` `, ``],
      [``, `-`, ``],
    ],
    [
      [`/`, `/`, `/`],
      [`/`, ` `, `/`],
      [`/`, `/`, `/`],
    ],
    [
      [`┌`, `─`, `┐`],
      [`│`, ` `, `│`],
      [`└`, `─`, `┘`],
    ],
    [
      [`╭`, `─`, `╮`],
      [`│`, ` `, `│`],
      [`╰`, `─`, `╯`],
    ],
    [
      [`╔`, `═`, `╗`],
      [`║`, ` `, `║`],
      [`╚`, `═`, `╝`],
    ],
  ];

  const commentsPreset = useComputed$(() =>
    JSON.stringify([commentsOpen.value, commentsClose.value])
  );

  useTask$(({ track }) => {
    track(
      () =>
        text.value.length +
        commentsOpen.value.length +
        commentsClose.value.length +
        boxType.value
    );

    const value = text.value || placeholder;
    const lines = value.split("\n");
    const length = Math.max(...lines.map((m) => m.length));
    const box = boxTypes[boxType.value];

    // Increase the textarea height
    rows.value = lines.length < 1 ? 1 : lines.length;

    boxed.value = [
      `${commentsOpen.value}${box[0][0]}${box[0][1].repeat(
        length + padding.value * 2
      )}${box[0][2]}${commentsClose.value}`,
      padding.value > 1
        ? `${commentsOpen.value}${box[1][0]}${" ".repeat(
            length + padding.value * 2
          )}${box[1][2]}${commentsClose.value}`
        : "noop",
      ...lines.map(
        (m) =>
          `${commentsOpen.value}${box[1][0]}${" ".repeat(
            padding.value
          )}${m}${" ".repeat(length - m.length)}${" ".repeat(padding.value)}${
            box[1][2]
          }${commentsClose.value}`
      ),
      padding.value > 1
        ? `${commentsOpen.value}${box[1][0]}${" ".repeat(
            length + padding.value * 2
          )}${box[1][2]}${commentsClose.value}`
        : "noop",
      `${commentsOpen.value}${box[2][0]}${box[2][1].repeat(
        length + padding.value * 2
      )}${box[2][2]}${commentsClose.value}`,
    ]
      .filter((f) => f != "noop")
      .join("\n");
  });

  const updateComments = $((event: any) => {
    const target = event.target || event.srcElement;
    const value = JSON.parse(target.value);

    commentsOpen.value = value[0];
    commentsClose.value = value[1];
  });

	const copy = $(() => {
		navigator.clipboard.writeText(boxed.value).then(function() {
			copied.value = true;
			setTimeout(() => {
				copied.value = false;
			}, 2000)
		});
	});

  return (
    <>
      <div class="p-8">
        <h1 class="text-4xl font-extrabold sr-only">Boxet</h1>
        <h3 class="text-xl font-extrabold sr-only">Box for text</h3>

				<div class="w-80 mb-3" dangerouslySetInnerHTML={logo}></div>

        <div class="mt-5">
          <div class="font-bold mb-1">Comments</div>
          <div class="flex gap-2 items-center">
            <input
              class="comment border border-slate-300 focus:border-teal-400 rounded-md outline-none px-3 py-2 w-[70px] font-mono text-sm"
              type="text"
              bind:value={commentsOpen}
            />
            <input
              class="comment border border-slate-300 focus:border-teal-400 rounded-md outline-none px-3 py-2 w-[70px] font-mono text-sm text-end"
              type="text"
              bind:value={commentsClose}
            />
            <select
              class="comment border border-slate-300 focus:border-teal-400 rounded-md outline-none px-2 py-2 w-36 text-sm"
              value={commentsPreset.value}
              onChange$={updateComments}
            >
              <option value="" disabled>
                Custom!
              </option>
              <option value={JSON.stringify(["", ""])}>None</option>
              <option value={JSON.stringify(["# ", ""])} selected>Shell</option>
              <option value={JSON.stringify(["/* ", " */"])}>Block</option>
              <option value={JSON.stringify(["// ", ""])}>Inline</option>
              <option value={JSON.stringify(["; ", ""])}>PHP INI</option>
              <option value="noop" disabled>
                Many more to come...
              </option>
            </select>
          </div>
        </div>

        <div class="mt-3">
          <div class="font-bold mb-1">Box Type</div>
          <div class="flex flex-wrap gap-2 items-center">
            {boxTypes.map((el, index) => (
              <div
                key={index}
                onClick$={() => (boxType.value = index)}
                class={[
                  boxType.value == index
                    ? "border-teal-400 ring-1 ring-offset-2 ring-teal-100 bg-teal-50"
                    : "border-slate-300",
                  "font-mono border rounded-md p-3 whitespace-pre cursor-pointer transition w-24 text-center flex-grow",
                ]}
              >
                <div>{`${el[0][0]}${el[0][1].repeat(padding.value * 2 + 1)}${
                  el[0][2]
                }`}</div>
                <div>{`${el[1][0]}${el[1][1].repeat(padding.value * 2 + 1)}${
                  el[1][2]
                }`}</div>
                <div>{`${el[2][0]}${el[2][1].repeat(padding.value * 2 + 1)}${
                  el[2][2]
                }`}</div>
              </div>
            ))}
          </div>
        </div>

        <div class="mt-3">
          <div class="font-bold mb-1">Input</div>
          <textarea
            class="border border-slate-300 focus:border-teal-400 rounded-md outline-none p-3 w-full resize-none font-mono text-sm placeholder:text-slate-400"
            rows={rows.value}
            bind:value={text}
            placeholder={placeholder}
          ></textarea>
        </div>

        <div class="result mt-5">
          <pre
            class={[
              !text.value ? "text-slate-400" : "",
              "border border-slate-300 rounded-md p-3 w-full font-mono text-sm",
            ]}
          >
            {boxed.value}
          </pre>

					<div class="flex items-center mt-3 gap-2">
						<button
							type="button"
							class="text-teal-50 bg-teal-400 hover:bg-teal-500 active:bg-teal-700 px-5 py-2 transition"
							onClick$={copy}
						>
							Copy!
							{/*
							<i>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									height="48"
									viewBox="0 -960 960 960"
									width="48"
								>
									<path d="M378-241q-9 0-17.5-3.5T345-255L164-436q-14-14-14-34t14-34q14-14 33.5-14t34.5 14l146 146 350-349q14-14 33.5-14.5T795-707q14 14 14 34t-14 34L411-255q-7 7-15.5 10.5T378-241Z" />
								</svg>
							</i>
							*/}
						</button>
						<div class={[
							'text-teal-500 font-bold transition-opacity',
							copied.value ? 'opacity-100' : 'opacity-0',
						].join(' ')}>Copied!</div>
					</div>
        </div>
      </div>
    </>
  );
});

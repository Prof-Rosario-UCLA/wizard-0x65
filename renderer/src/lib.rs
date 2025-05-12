mod utils;

use bevy::prelude::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    fn test_function(a: i32) -> i32;
}

#[wasm_bindgen]
pub fn greet() {
    alert("MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW");
}

#[wasm_bindgen(start)]
fn main() {
    alert("MEOW");
    test_function(5);
    let mut app = App::new();
    app.add_plugins(DefaultPlugins.set(WindowPlugin {
        primary_window: Some(Window {
            // provide the ID selector string here
            canvas: Some("#game-canvas".into()),
            // ... any other window properties ...
            ..default()
        }),
        ..default()
    }));
    app.run();
}

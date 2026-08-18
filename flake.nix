{
  description = "Flake utils demo";

  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in {
        devShells = {
          default = pkgs.mkShell {
            packages = with pkgs; [
              nodejs
              pnpm

              claude-code
              just
              mermaid-cli
              presenterm

              # quarto 1.9.37+ has a pandoc option regression; pin to 1.8.26
              # (flake is already --impure so builtins.storePath is available)
              (builtins.storePath "/nix/store/q5hqdd011hs9a596blpnc0l5gr5cv2av-quarto-1.8.26")
              typst
            ];
          };
        };
      });
}

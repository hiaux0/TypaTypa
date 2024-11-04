import Aurelia, { Registration } from "aurelia";
import { RouterConfiguration } from "@aurelia/router-lite";
import { AureliaSlickGridConfiguration } from "aurelia-slickgrid";
import { MyApp } from "./my-app";
import { Scratch } from "./ui/scratch/scratch";
import { Store } from "./common/modules/store";
import { VimInputHandlerV2 } from "./features/vim/VimInputHandlerV2";
import {
    ILoggerService,
    LoggerService,
    VimInputHandler
} from "./features/vim/VimInputHandler";
import { atoms, attributes, molecules, organisms } from "./main";

const appContainer =
    // DI.createContainer()
    Aurelia
        //.register(
        //  Registration.instance(IPlatform, PLATFORM),
        //  StandardConfiguration.customize((y) => {
        //    y.coercingOptions = {
        //      coerceNullish: false,
        //      enableCoercion: true,
        //    };
        //  }),
        //  // Registration.instance(IReadOnlyProvider, new CeloProvider({ url: CHAIN_URL, skipFetchSetup: true })),
        //)
        // .register(RouterConfiguration.customize({ useUrlFragmentHash: true }))
        .register(
            RouterConfiguration.customize({
                useUrlFragmentHash: false,
                basePath: "/",
                activeClass: "noop",
                useHref: false,
            })
        )

        .register([...atoms, ...attributes, ...molecules, ...organisms, Scratch])
        .register(Registration.singleton(Store, Store))
        .register(VimInputHandler)
        .register(VimInputHandlerV2)
        // .register(Registration.singleton(VimInputHandlerV2, VimInputHandlerV2))
        // .register(vimContainer)
        .register(Registration.singleton(ILoggerService, LoggerService))
        .register(Registration.singleton(IPaymentProcessor))
        // .register()
        .register(
            AureliaSlickGridConfiguration.customize((config) => {
                // change any of the default global options
                config.options.gridMenu!.iconCssClass = "mdi mdi-menu";

                // we strongly suggest you add DOMPurify as a sanitizer
                //config.options.sanitizer = (dirtyHtml) =>
                //  DOMPurify.sanitize(dirtyHtml, {
                //    ADD_ATTR: ["level"],
                //    RETURN_TRUSTED_TYPE: true,
                //  });
            })
        )

        .app(MyApp)
        .start();


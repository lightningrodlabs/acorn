(self.webpackChunkacorn_ui=self.webpackChunkacorn_ui||[]).push([[3200],{"./src/stories/UpdateModal.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{UpdateModal:()=>UpdateModal_stories_UpdateModal,__namedExportsOrder:()=>__namedExportsOrder,default:()=>UpdateModal_stories});var react=__webpack_require__("./node_modules/react/index.js"),Modal=(__webpack_require__("./src/variables.scss"),__webpack_require__("./src/components/Modal/Modal.tsx")),react_router=(__webpack_require__("./src/components/UpdateModal/UpdateModal.scss"),__webpack_require__("./node_modules/react-router/esm/react-router.js")),Button=__webpack_require__("./src/components/Button/Button.tsx"),Typography=__webpack_require__("./src/components/Typography/Typography.tsx"),Tag=__webpack_require__("./src/components/Tag/Tag.tsx"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const UpdateModal_UpdateModal=({show,onClose,releaseTag,releaseSize,heading,content})=>{const history=(0,react_router.k6)(),[contentDiv,setContentDiv]=(0,react.useState)(),[screenHeight,setScreenHeight]=(0,react.useState)(),[contentHeight,setContentHeight]=(0,react.useState)();return(0,react.useEffect)((()=>{const windowResize=()=>{setScreenHeight(screen.height)};return setScreenHeight(screen.height),window.addEventListener("resize",windowResize),()=>{window.removeEventListener("resize",windowResize)}}),[]),(0,react.useEffect)((()=>{contentDiv&&setContentHeight(contentDiv.clientHeight)}),[contentDiv,content]),(0,jsx_runtime.jsx)("div",{className:"update-modal-wrapper",children:(0,jsx_runtime.jsx)(Modal.Z,{white:!0,active:show,onClose,children:(0,jsx_runtime.jsxs)("div",{className:"update-modal-content-wrapper",children:[(0,jsx_runtime.jsxs)("div",{className:"update-modal-release-tag-size",children:[(0,jsx_runtime.jsx)("div",{className:"update-modal-release-tag-wrapper",children:(0,jsx_runtime.jsx)(Tag.Z,{text:`Release ${releaseTag}`,backgroundColor:"#277670"})}),releaseSize&&(0,jsx_runtime.jsx)("div",{className:"update-modal-release-size",children:releaseSize})]}),(0,jsx_runtime.jsx)("div",{className:"update-modal-heading",children:(0,jsx_runtime.jsx)(Typography.Z,{style:"heading-modal",children:heading})}),(0,jsx_runtime.jsx)("div",{className:"update-modal-content "+(contentHeight>.3*screenHeight?"long-scroll":""),children:(0,jsx_runtime.jsx)("div",{className:"update-modal-content-text",ref:setContentDiv,children:(0,jsx_runtime.jsx)(Typography.Z,{style:"body-modal",children:content})})}),(0,jsx_runtime.jsxs)("div",{className:"update-modal-buttons-wrapper",children:[(0,jsx_runtime.jsx)("div",{className:"update-modal-button-primary",children:(0,jsx_runtime.jsx)(Button.Z,{onClick:()=>{history.push("/run-update")},icon:"arrow-circle-up.svg",text:"Update Now"})}),(0,jsx_runtime.jsx)("div",{className:"update-modal-button-secondary",onClick:onClose,children:"I'll update later"})]})]})})})};UpdateModal_UpdateModal.displayName="UpdateModal";const components_UpdateModal_UpdateModal=UpdateModal_UpdateModal;try{UpdateModal_UpdateModal.displayName="UpdateModal",UpdateModal_UpdateModal.__docgenInfo={description:"",displayName:"UpdateModal",props:{show:{defaultValue:null,description:"",name:"show",required:!0,type:{name:"boolean"}},onClose:{defaultValue:null,description:"",name:"onClose",required:!0,type:{name:"() => void"}},releaseTag:{defaultValue:null,description:"",name:"releaseTag",required:!0,type:{name:"string"}},releaseSize:{defaultValue:null,description:"",name:"releaseSize",required:!1,type:{name:"string"}},heading:{defaultValue:null,description:"",name:"heading",required:!0,type:{name:"string"}},content:{defaultValue:null,description:"",name:"content",required:!0,type:{name:"ReactElement<any, string | JSXElementConstructor<any>>"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/UpdateModal/UpdateModal.tsx#UpdateModal"]={docgenInfo:UpdateModal_UpdateModal.__docgenInfo,name:"UpdateModal",path:"src/components/UpdateModal/UpdateModal.tsx#UpdateModal"})}catch(__react_docgen_typescript_loader_error){}const UpdateModal_stories={title:"Dashboard/UpdateModal",component:components_UpdateModal_UpdateModal},Template=args=>(0,jsx_runtime.jsx)(components_UpdateModal_UpdateModal,{...args});Template.displayName="Template";const UpdateModal_stories_UpdateModal=Template.bind({});UpdateModal_stories_UpdateModal.storyName="UpdateModal";const args={show:!0,onClose:function(){throw new Error("Function not implemented.")},releaseTag:"v3.5.0-alpha",releaseSize:"120MB",heading:"Update to newest version of Acorn",content:(0,jsx_runtime.jsxs)("div",{children:["Update is required to access a shared project brought to the updated version by another team member. You can continue using your personal projects without the update. See ",(0,jsx_runtime.jsx)("a",{children:"Release Notes & Changelog"}),"."]})};UpdateModal_stories_UpdateModal.args=args,UpdateModal_stories_UpdateModal.parameters={...UpdateModal_stories_UpdateModal.parameters,docs:{...UpdateModal_stories_UpdateModal.parameters?.docs,source:{originalSource:"args => {\n  return <UpdateModalComponent {...args} />;\n}",...UpdateModal_stories_UpdateModal.parameters?.docs?.source}}};const __namedExportsOrder=["UpdateModal"]},"./src/components/Tag/Tag.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js"),__webpack_require__("./src/components/Tag/Tag.scss");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/jsx-runtime.js");const Tag=({text,backgroundColor})=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div",{className:"tag-wrapper",style:{backgroundColor},children:text});Tag.displayName="Tag";const __WEBPACK_DEFAULT_EXPORT__=Tag;try{Tag.displayName="Tag",Tag.__docgenInfo={description:"",displayName:"Tag",props:{text:{defaultValue:null,description:"",name:"text",required:!0,type:{name:"string"}},backgroundColor:{defaultValue:null,description:"",name:"backgroundColor",required:!0,type:{name:"string"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Tag/Tag.tsx#Tag"]={docgenInfo:Tag.__docgenInfo,name:"Tag",path:"src/components/Tag/Tag.tsx#Tag"})}catch(__react_docgen_typescript_loader_error){}},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Tag/Tag.scss":(module,exports,__webpack_require__)=>{(exports=__webpack_require__("./node_modules/css-loader/dist/runtime/api.js")(!1)).push([module.id,".tag-wrapper{font:.75rem var(--font-family-primary-bold);line-height:1.65;color:var(--text-color-dark-bg);letter-spacing:.02rem;padding:.175rem .6875rem;border-radius:.5rem;width:fit-content}",""]),module.exports=exports},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/UpdateModal/UpdateModal.scss":(module,exports,__webpack_require__)=>{(exports=__webpack_require__("./node_modules/css-loader/dist/runtime/api.js")(!1)).push([module.id,".update-modal-wrapper .modal-wrapper{width:32rem;padding-bottom:3.5rem}.update-modal-wrapper .update-modal-content-wrapper .update-modal-release-tag-size{display:flex;flex-direction:row;align-items:center;margin-bottom:1rem}.update-modal-wrapper .update-modal-content-wrapper .update-modal-release-tag-size .update-modal-release-tag-wrapper{margin-right:.25rem}.update-modal-wrapper .update-modal-content-wrapper .update-modal-release-tag-size .update-modal-release-size{font:.75rem var(--font-family-primary-regular);color:var(--text-color-tertiary);background-color:var(--bg-color-primary);padding:.25rem .4rem;border-radius:.375rem}.update-modal-wrapper .update-modal-content-wrapper .update-modal-heading{margin-bottom:1.5rem}.update-modal-wrapper .update-modal-content-wrapper .update-modal-content.long-scroll{background-color:var(--bg-color-primary);overflow-y:hidden;height:30vh;border-radius:.75rem}.update-modal-wrapper .update-modal-content-wrapper .update-modal-content.long-scroll .update-modal-content-text{padding:1rem;box-sizing:border-box;overflow-y:scroll;height:100%}.update-modal-wrapper .update-modal-content-wrapper .update-modal-buttons-wrapper{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:2rem}.update-modal-wrapper .update-modal-content-wrapper .update-modal-buttons-wrapper .update-modal-button-secondary{font:.815rem var(--font-family-primary-medium);color:var(--text-color-tertiary);line-height:1.45;cursor:pointer;transition:.2s all ease}.update-modal-wrapper .update-modal-content-wrapper .update-modal-buttons-wrapper .update-modal-button-secondary:hover{color:var(--text-color-secondary);text-decoration:underline}",""]),module.exports=exports},"./src/components/Tag/Tag.scss":(module,__unused_webpack_exports,__webpack_require__)=>{var api=__webpack_require__("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),content=__webpack_require__("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Tag/Tag.scss");"string"==typeof(content=content.__esModule?content.default:content)&&(content=[[module.id,content,""]]);var options={insert:"head",singleton:!1};api(content,options);module.exports=content.locals||{}},"./src/components/UpdateModal/UpdateModal.scss":(module,__unused_webpack_exports,__webpack_require__)=>{var api=__webpack_require__("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),content=__webpack_require__("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/UpdateModal/UpdateModal.scss");"string"==typeof(content=content.__esModule?content.default:content)&&(content=[[module.id,content,""]]);var options={insert:"head",singleton:!1};api(content,options);module.exports=content.locals||{}}}]);
export default  {
    platform: 'electron',
    select: (spec) => 'electron' in spec ? spec.electron : 'native' in spec ? spec.native : spec.default,
};

if(!window.ELECTRON){
    Object.defineProperties(Window,{
        ELECTRON : {
            value : {},
        }
    })
}
  
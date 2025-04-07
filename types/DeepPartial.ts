export type DeepPartial<FullObjType, TargetValueType> = {
  [K in keyof FullObjType]?:
    | (FullObjType[K] extends object
        ? FullObjType[K] extends Array<any>
          ? TargetValueType[]
          : DeepPartial<FullObjType[K], TargetValueType>
        : TargetValueType)
    | TargetValueType;
};
